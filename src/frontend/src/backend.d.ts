import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface ReferralRecord {
    id: bigint;
    status: Variant_pending_paid;
    refereeId: Principal;
    referredAt: bigint;
    referrerId: Principal;
    referredAmount: bigint;
    commissionAmount: bigint;
    commissionRate: number;
    purchaseId: bigint;
    courseId: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface WithdrawalRequest {
    id: bigint;
    status: Variant_pending_paid;
    userId: Principal;
    processedAt?: bigint;
    upiId: string;
    amount: bigint;
    requestedAt: bigint;
}
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface ReferralCode {
    code: string;
    userId: Principal;
    createdAt: bigint;
    usageCount: bigint;
    isActive: boolean;
    discount: bigint;
    commissionRate: number;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_pending_paid {
    pending = "pending",
    paid = "paid"
}
export interface backendInterface {
    activateReferralCodeById(id: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    cancelReferralRecord(id: bigint): Promise<void>;
    cancelWithdrawal(withdrawalId: bigint): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createReferralCode(code: string, discount: bigint): Promise<bigint>;
    createReferralRecord(referralCodeId: bigint, courseId: string, referredAmount: bigint): Promise<bigint>;
    deactivateReferralCode(id: bigint): Promise<void>;
    getCallerUserRole(): Promise<UserRole>;
    getPaidReferralList(): Promise<Array<ReferralRecord>>;
    getPendingReferralList(): Promise<Array<ReferralRecord>>;
    getReferralCode(code: string): Promise<ReferralCode | null>;
    getReferralCodeById(id: bigint): Promise<ReferralCode>;
    getReferralCodes(): Promise<Array<ReferralCode>>;
    getReferralCountByUser(referrerId: Principal): Promise<bigint>;
    getReferralRecord(id: bigint): Promise<ReferralRecord>;
    getReferralRecordList(): Promise<Array<ReferralRecord>>;
    getReferralRecordsByReferrer(referrerId: Principal): Promise<Array<ReferralRecord>>;
    getReferralRecordsByUserId(userId: Principal): Promise<Array<ReferralRecord>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getTotalReferralCount(): Promise<bigint>;
    getTotalReferralRevenue(): Promise<bigint>;
    getUserWithdrawals(userId: Principal): Promise<Array<WithdrawalRequest>>;
    getWithdrawals(): Promise<Array<WithdrawalRequest>>;
    getWithdrawalsByStatus(status: Variant_pending_paid): Promise<Array<WithdrawalRequest>>;
    isCallerAdmin(): Promise<boolean>;
    isReferralCodeActive(id: bigint): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    isValidReferralCode(id: bigint): Promise<boolean>;
    requestWithdrawal(upiId: string, userId: Principal, amount: bigint): Promise<bigint>;
    setReferralStatus(id: bigint, status: Variant_pending_paid): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateReferralDiscount(id: bigint, discount: bigint): Promise<void>;
    updateReferralRecord(id: bigint, record: ReferralRecord): Promise<void>;
    updateWithdrawalStatus(withdrawalId: bigint, status: Variant_pending_paid): Promise<void>;
    validateReferralCodeById(code: bigint): Promise<void>;
}
