import Principal "mo:core/Principal";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";


actor {
  // Mix in authentication
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type CommissionSlab = {
    minReferrals : Nat;
    maxReferrals : Nat;
    rate : Nat;
  };

  public type Course = {
    id : Text;
    title : Text;
    description : Text;
    instructor : Text;
    thumbnailUrl : Text;
    price : Nat;
    level : Text;
    category : Text;
    isPublished : Bool;
    referralEnabled : Bool;
    commissionSlabs : [CommissionSlab];
  };

  public type ReferralCode = {
    code : Text;
    userId : Principal;
    discount : Nat;
    createdAt : Int;
    usageCount : Nat;
    commissionRate : Float;
    isActive : Bool;
  };

  public type ReferralRecord = {
    id : Nat;
    courseId : Text;
    referrerId : Principal;
    refereeId : Principal;
    referredAt : Int;
    purchaseId : Nat;
    commissionAmount : Nat;
    referredAmount : Nat;
    commissionRate : Float;
    status : {
      #pending;
      #paid;
    };
  };

  public type WithdrawalRequest = {
    id : Nat;
    userId : Principal;
    upiId : Text;
    amount : Nat;
    requestedAt : Int;
    processedAt : ?Int;
    status : {
      #pending;
      #paid;
    };
  };

  // Persistent state
  var stripeConfig : ?Stripe.StripeConfiguration = null;
  let referralCodes = Map.empty<Nat, ReferralCode>();
  let referralRecords = Map.empty<Nat, ReferralRecord>();
  let withdrawalRequests = Map.empty<Nat, WithdrawalRequest>();
  var nextReferralId = 0;
  var nextWithdrawalId = 0;
  let courses = Map.empty<Text, Course>();

  func getStripeConfig() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  func getReferralCodeIntern(id : Nat) : ReferralCode {
    switch (referralCodes.get(id)) {
      case (?referralCode) { referralCode };
      case (null) { Runtime.trap("Invalid referral code ID!") };
    };
  };

  public query ({ caller }) func getReferralCodeById(id : Nat) : async ReferralCode {
    let code = getReferralCodeIntern(id);
    // Users can only view their own referral codes, admins can view all
    if (caller != code.userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own referral codes");
    };
    code;
  };

  // Public query - anyone can look up a referral code by its text code
  public query func getReferralCode(code : Text) : async ?ReferralCode {
    let (key, value) = switch (referralCodes.entries().find(func(_k, v) { v.code == code })) {
      case (?result) { result };
      case (null) { return null };
    };
    ?value;
  };

  // Admin-only: get all referral codes
  public query ({ caller }) func getReferralCodes() : async [ReferralCode] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all referral codes");
    };
    referralCodes.values().toArray();
  };

  public shared ({ caller }) func createReferralCode(code : Text, discount : Nat) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can create a referral code");
    };
    let id = referralCodes.size();
    let newCode : ReferralCode = {
      code;
      userId = caller;
      discount;
      createdAt = Time.now();
      usageCount = 0;
      commissionRate = 0.0;
      isActive = true;
    };
    referralCodes.add(id, newCode);
    id;
  };

  public shared ({ caller }) func createReferralRecord(referralCodeId : Nat, courseId : Text, referredAmount : Nat) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can create a referral record");
    };
    let referralId = nextReferralId;
    nextReferralId += 1;
    let newRecord : ReferralRecord = {
      id = referralId;
      courseId;
      referrerId = caller;
      refereeId = caller;
      referredAt = Time.now();
      purchaseId = referralId;
      commissionAmount = 0;
      referredAmount;
      commissionRate = 0.0;
      status = #pending;
    };
    referralRecords.add(referralId, newRecord);
    referralId;
  };

  public shared ({ caller }) func cancelReferralRecord(id : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can cancel a referral record");
    };
    let referralRecord = switch (referralRecords.get(id)) {
      case (null) { Runtime.trap("Invalid referral record ID. Please enter a valid record ID.") };
      case (?value) { value };
    };
    // Only the referrer or admin can cancel
    if (caller != referralRecord.referrerId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only cancel your own referral records");
    };
    referralRecords.remove(id);
  };

  public shared ({ caller }) func updateReferralRecord(id : Nat, record : ReferralRecord) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can update a referral record");
    };
    let existingRecord = switch (referralRecords.get(id)) {
      case (null) { Runtime.trap("Invalid referral record ID. Please enter a valid record ID.") };
      case (?value) { value };
    };
    // Only the referrer or admin can update
    if (caller != existingRecord.referrerId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only update your own referral records");
    };
    referralRecords.add(id, record);
  };

  public shared ({ caller }) func getReferralRecord(id : Nat) : async ReferralRecord {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can access a referral record");
    };
    let referralRecord = switch (referralRecords.get(id)) {
      case (null) { Runtime.trap("Invalid referral record ID. Please enter a valid record ID.") };
      case (?value) { value };
    };
    // Only the referrer, referee, or admin can view
    if (caller != referralRecord.referrerId and caller != referralRecord.refereeId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own referral records");
    };
    referralRecord;
  };

  public query ({ caller }) func getReferralRecordsByUserId(userId : Principal) : async [ReferralRecord] {
    // Users can only view their own records, admins can view any user's records
    if (caller != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own referral records");
    };
    referralRecords.values().toArray().filter(func(r) { r.referrerId == userId });
  };

  public query ({ caller }) func getReferralRecordsByReferrer(referrerId : Principal) : async [ReferralRecord] {
    // Users can only view their own records, admins can view any user's records
    if (caller != referrerId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own referral records");
    };
    referralRecords.values().toArray().filter(func(r) { r.referrerId == referrerId });
  };

  // Admin-only: get all referral records
  public query ({ caller }) func getReferralRecordList() : async [ReferralRecord] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all referral records");
    };
    referralRecords.values().toArray();
  };

  // Admin-only: get pending referrals
  public query ({ caller }) func getPendingReferralList() : async [ReferralRecord] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view pending referral list");
    };
    referralRecords.values().toArray().filter(func(r) { r.status == #pending });
  };

  // Admin-only: get paid referrals
  public query ({ caller }) func getPaidReferralList() : async [ReferralRecord] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view paid referral list");
    };
    referralRecords.values().toArray().filter(func(r) { r.status == #paid });
  };

  // Admin-only: set referral status
  public shared ({ caller }) func setReferralStatus(id : Nat, status : { #pending; #paid }) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only administrators can set the status of a referral record");
    };
    let referralRecord = switch (referralRecords.get(id)) {
      case (null) { Runtime.trap("Invalid record ID. Please enter a valid record ID.") };
      case (?value) { value };
    };
    let updatedRecord = { referralRecord with status };
    referralRecords.add(id, updatedRecord);
  };

  public shared ({ caller }) func updateReferralDiscount(id : Nat, discount : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can update a referral discount");
    };
    let referralCode = switch (referralCodes.get(id)) {
      case (null) { Runtime.trap("Invalid code ID. Please enter a valid code ID.") };
      case (?value) { value };
    };
    // Only the owner or admin can update
    if (caller != referralCode.userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only update your own referral codes");
    };
    let updatedCode = { referralCode with discount };
    referralCodes.add(id, updatedCode);
  };

  public shared ({ caller }) func validateReferralCodeById(code : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can validate a referral code");
    };
    let referralCode = switch (referralCodes.get(code)) {
      case (null) { Runtime.trap("Invalid code ID. Please enter a valid code ID.") };
      case (?value) { value };
    };
    if (not referralCode.isActive) {
      Runtime.trap("Referral code is not currently active.");
    };
  };

  public shared ({ caller }) func activateReferralCodeById(id : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can activate a referral code");
    };
    let referralCode = switch (referralCodes.get(id)) {
      case (null) { Runtime.trap("Invalid code ID. Please enter a valid code ID.") };
      case (?value) { value };
    };
    // Only the owner or admin can activate
    if (caller != referralCode.userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only activate your own referral codes");
    };
    if (referralCode.isActive) {
      Runtime.trap("Referral code is already active.");
    } else {
      let updatedCode = { referralCode with isActive = true };
      referralCodes.add(id, updatedCode);
    };
  };

  public shared ({ caller }) func deactivateReferralCode(id : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can deactivate a referral code");
    };
    let referralCode = switch (referralCodes.get(id)) {
      case (null) { Runtime.trap("Invalid code ID. Please enter a valid code ID.") };
      case (?value) { value };
    };
    // Only the owner or admin can deactivate
    if (caller != referralCode.userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only deactivate your own referral codes");
    };
    if (not referralCode.isActive) {
      Runtime.trap("Referral code is already inactive.");
    } else {
      let updatedCode = { referralCode with isActive = false };
      referralCodes.add(id, updatedCode);
    };
  };

  // Public query - anyone can check if a code is active
  public query func isReferralCodeActive(id : Nat) : async Bool {
    (getReferralCodeIntern(id)).isActive;
  };

  // Public query - anyone can validate a code
  public query func isValidReferralCode(id : Nat) : async Bool {
    (getReferralCodeIntern(id)).isActive;
  };

  public shared ({ caller }) func requestWithdrawal(upiId : Text, userId : Principal, amount : Nat) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can request a withdrawal");
    };
    // Users can only request withdrawals for themselves
    if (caller != userId) {
      Runtime.trap("Unauthorized: Can only request withdrawals for yourself");
    };
    if (amount < 50) {
      Runtime.trap("Withdrawal amount must be at least 50 rupees.");
    };
    let withdrawalId = nextWithdrawalId;
    nextWithdrawalId += 1;
    let newRequest : WithdrawalRequest = {
      id = withdrawalId;
      userId;
      upiId;
      amount;
      requestedAt = Time.now();
      processedAt = null;
      status = #pending;
    };
    withdrawalRequests.add(withdrawalId, newRequest);
    withdrawalId;
  };

  // Admin-only: update withdrawal status
  public shared ({ caller }) func updateWithdrawalStatus(withdrawalId : Nat, status : { #pending; #paid }) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can modify the status of a withdrawal request");
    };
    let request = switch (withdrawalRequests.get(withdrawalId)) {
      case (null) { Runtime.trap("Withdrawal request with the ID: " # withdrawalId.toText() # " does not exist. Please provide a valid ID to update the status.") };
      case (?value) { value };
    };
    if (request.status == status) {
      Runtime.trap("Withdrawal request is already in the requested status.");
    };
    let updatedRequest = {
      request with
      status;
      processedAt = if (status == #paid) { ?Time.now() } else { null };
    };
    withdrawalRequests.add(withdrawalId, updatedRequest);
  };

  public shared ({ caller }) func cancelWithdrawal(withdrawalId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can cancel a withdrawal request");
    };
    let request = switch (withdrawalRequests.get(withdrawalId)) {
      case (null) { Runtime.trap("Withdrawal request with the ID: " # withdrawalId.toText() # " does not exist. Please provide a valid ID to cancel the withdrawal request.") };
      case (?value) { value };
    };
    // Users can only cancel their own withdrawals, admins can cancel any
    if (caller != request.userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only cancel your own withdrawal requests");
    };
    withdrawalRequests.remove(withdrawalId);
  };

  // Admin-only: get all withdrawals
  public query ({ caller }) func getWithdrawals() : async [WithdrawalRequest] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all withdrawals");
    };
    withdrawalRequests.values().toArray();
  };

  public query ({ caller }) func getUserWithdrawals(userId : Principal) : async [WithdrawalRequest] {
    // Users can only view their own withdrawals, admins can view any user's withdrawals
    if (caller != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own withdrawals");
    };
    withdrawalRequests.values().toArray().filter(func(w) { w.userId == userId });
  };

  // Admin-only: get withdrawals by status
  public query ({ caller }) func getWithdrawalsByStatus(status : { #pending; #paid }) : async [WithdrawalRequest] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view withdrawals by status");
    };
    withdrawalRequests.values().toArray().filter(func(w) { w.status == status });
  };

  // Public query - analytics data
  public query func getTotalReferralCount() : async Nat {
    referralRecords.size();
  };

  public query ({ caller }) func getReferralCountByUser(referrerId : Principal) : async Nat {
    // Users can only view their own count, admins can view any user's count
    if (caller != referrerId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own referral count");
    };
    referralRecords.values().toArray().filter(func(r) { r.referrerId == referrerId }).size();
  };

  // Admin-only: total referral revenue
  public query ({ caller }) func getTotalReferralRevenue() : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view total referral revenue");
    };
    referralRecords.values().toArray().foldLeft(
      0,
      func(acc, r) { acc + r.commissionAmount },
    );
  };

  public query func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    stripeConfig := ?config;
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfig(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    await Stripe.createCheckoutSession(getStripeConfig(), caller, items, successUrl, cancelUrl, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };
};
