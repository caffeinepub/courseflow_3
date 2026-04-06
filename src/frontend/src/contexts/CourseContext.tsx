import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { User } from "./AuthContext";

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  type: "video" | "pdf";
  contentUrl: string;
  pdfUrl?: string;
  duration: number;
  isFree: boolean;
  order: number;
  description: string;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  thumbnailUrl: string;
  price: number;
  instructor: string;
  tags: string[];
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  isPublished: boolean;
  modules: Module[];
  rating: number;
  reviewCount: number;
  totalDuration: number;
}

export interface Purchase {
  userId: string;
  courseId: string;
  paymentId: string;
  purchasedAt: string;
  referralCode?: string;
}

export interface Progress {
  userId: string;
  courseId: string;
  completedLessons: string[];
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  lessonId: string;
  courseId: string;
  text: string;
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  lessonId: string;
  question: string;
  type: "mcq" | "fill-blank" | "short-answer";
  options: string[]; // for MCQ only
  correctIndex?: number; // for MCQ only
  correctAnswer?: string; // for fill-blank (case-insensitive match)
}

export interface QuizSubmission {
  userId: string;
  lessonId: string;
  answers: Array<number | string>;
  score: number;
  total: number;
  submittedAt: string;
}

export interface Certificate {
  id: string;
  userId: string;
  userName: string;
  courseId: string;
  courseName: string;
  instructor: string;
  completionDate: string;
  issuedAt: string;
}

export interface ReferralSettings {
  courseId: string;
  enabled: boolean;
  slabs: Array<{
    minReferrals: number;
    maxReferrals: number | null;
    rate: number;
  }>;
}

export interface CommissionTier {
  minReferrals: number;
  maxReferrals: number | null; // null = unlimited
  rate: number; // percentage
}

export interface ReferralRecord {
  id: string;
  referrerId: string;
  refereeId: string;
  courseId: string;
  commission: number;
  status: "pending" | "paid";
  createdAt: string;
}

export interface Withdrawal {
  id: string;
  userId: string;
  upiId: string;
  amount: number;
  status: "pending" | "paid";
  requestedAt: string;
}

interface CourseContextValue {
  courses: Course[];
  isLoading: boolean;
  getCourse: (id: string) => Course | undefined;
  getCourses: () => Course[];
  createCourse: (data: Omit<Course, "id">) => Promise<Course>;
  updateCourse: (id: string, data: Partial<Course>) => Promise<Course>;
  deleteCourse: (id: string) => Promise<void>;
  purchaseCourse: (
    userId: string,
    courseId: string,
    referralCode?: string,
  ) => Promise<void>;
  getPurchases: (userId: string) => Purchase[];
  hasAccess: (userId: string, courseId: string) => boolean;
  getProgress: (userId: string, courseId: string) => Progress;
  markLessonComplete: (
    userId: string,
    courseId: string,
    lessonId: string,
  ) => void;
  addComment: (comment: Omit<Comment, "id" | "createdAt">) => Promise<Comment>;
  getComments: (lessonId: string) => Comment[];
  getQuiz: (lessonId: string) => QuizQuestion[];
  saveQuiz: (lessonId: string, questions: QuizQuestion[]) => void;
  submitQuiz: (
    submission: Omit<QuizSubmission, "submittedAt">,
  ) => Promise<void>;
  getQuizSubmission: (
    userId: string,
    lessonId: string,
  ) => QuizSubmission | undefined;
  getAllPurchases: () => Purchase[];
  // Certificate
  getCertificate: (userId: string, courseId: string) => Certificate | undefined;
  getCertificateById: (certId: string) => Certificate | undefined;
  getUserCertificates: (userId: string) => Certificate[];
  generateCertificate: (
    userId: string,
    courseId: string,
    userName: string,
  ) => Certificate;
  // Referral
  getUserReferralCode: (userId: string) => string;
  getReferralSettings: (courseId: string) => ReferralSettings;
  updateReferralSettings: (settings: ReferralSettings) => void;
  trackReferral: (
    referrerId: string,
    refereeId: string,
    courseId: string,
    coursePrice: number,
  ) => void;
  getUserReferrals: (userId: string) => ReferralRecord[];
  getUserEarnings: (userId: string) => {
    total: number;
    pending: number;
    paid: number;
  };
  // Withdrawal
  requestWithdrawal: (
    userId: string,
    upiId: string,
    amount: number,
  ) => Promise<void>;
  getUserWithdrawals: (userId: string) => Withdrawal[];
  getAllWithdrawals: () => Withdrawal[];
  updateWithdrawalStatus: (id: string, status: "pending" | "paid") => void;
  // Admin
  getAllUsers: () => User[];
  getAllReferralRecords: () => ReferralRecord[];
  // Commission Tiers
  getGlobalCommissionTiers: () => CommissionTier[];
  updateGlobalCommissionTiers: (tiers: CommissionTier[]) => void;
}

const CourseContext = createContext<CourseContextValue | undefined>(undefined);

const COURSES_KEY = "courseflow-courses";
const PURCHASES_KEY = "courseflow-purchases";
const PROGRESS_KEY = "courseflow-progress";
const COMMENTS_KEY = "courseflow-comments";
const QUIZ_KEY = "courseflow-quizzes";
const QUIZ_SUB_KEY = "courseflow-quiz-submissions";
const CERTS_KEY = "courseflow-certificates";
const REFERRAL_CODES_KEY = "courseflow-referral-codes";
const REFERRAL_SETTINGS_KEY = "courseflow-referral-settings";
const GLOBAL_COMMISSION_TIERS_KEY = "courseflow-global-commission-tiers";
const REFERRAL_RECORDS_KEY = "courseflow-referral-records";
const WITHDRAWALS_KEY = "courseflow-withdrawals";
const USERS_KEY = "courseflow-users";

function randomAlphanumeric(len: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length: len }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length)),
  ).join("");
}

function generateCertId(): string {
  return `CERT-${randomAlphanumeric(4)}-${randomAlphanumeric(4)}-${Date.now().toString(36).toUpperCase()}`;
}

const SEED_COURSES: Course[] = [
  {
    id: "course-1",
    title: "Complete Web Development Bootcamp 2024",
    shortDescription:
      "Master HTML, CSS, JavaScript, React, Node.js and more in this all-in-one bootcamp.",
    description:
      "This comprehensive course takes you from absolute beginner to professional web developer. You'll learn HTML5, CSS3, JavaScript ES6+, React, Node.js, Express, MongoDB, and deployment. By the end, you'll have built 5 real-world projects you can showcase in your portfolio.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=225&fit=crop",
    price: 2999,
    instructor: "Sarah Johnson",
    tags: ["HTML", "CSS", "JavaScript", "React", "Node.js"],
    category: "Web Development",
    level: "Beginner",
    isPublished: true,
    rating: 4.8,
    reviewCount: 2847,
    totalDuration: 4200,
    modules: [
      {
        id: "m1-1",
        courseId: "course-1",
        title: "HTML & CSS Fundamentals",
        description: "Learn the building blocks of every website.",
        order: 1,
        lessons: [
          {
            id: "l1-1-1",
            moduleId: "m1-1",
            title: "Introduction to HTML",
            type: "video",
            contentUrl: "https://www.youtube.com/embed/qz0aGYrrlhU",
            duration: 900,
            isFree: true,
            order: 1,
            description:
              "Get started with the fundamentals of HTML, the language of the web. We'll cover tags, elements, and document structure.",
          },
          {
            id: "l1-1-2",
            moduleId: "m1-1",
            title: "CSS Styling & Box Model",
            type: "video",
            contentUrl: "https://www.youtube.com/embed/1Rs2ND1ryYc",
            duration: 1200,
            isFree: false,
            order: 2,
            description:
              "Learn how to style HTML with CSS. Understand the box model, flexbox, and grid layout systems.",
          },
          {
            id: "l1-1-3",
            moduleId: "m1-1",
            title: "Responsive Design Principles",
            type: "video",
            contentUrl: "https://www.youtube.com/embed/srvUrASNj0s",
            duration: 1100,
            isFree: false,
            order: 3,
            description:
              "Build websites that look great on any screen size using media queries and responsive design techniques.",
          },
        ],
      },
      {
        id: "m1-2",
        courseId: "course-1",
        title: "JavaScript Essentials",
        description: "Build dynamic, interactive websites with JavaScript.",
        order: 2,
        lessons: [
          {
            id: "l1-2-1",
            moduleId: "m1-2",
            title: "JavaScript Basics & ES6+",
            type: "video",
            contentUrl: "https://www.youtube.com/embed/W6NZfCO5SIk",
            duration: 1500,
            isFree: false,
            order: 1,
            description:
              "Learn variables, functions, loops, and modern ES6+ syntax including arrow functions and destructuring.",
          },
          {
            id: "l1-2-2",
            moduleId: "m1-2",
            title: "DOM Manipulation",
            type: "video",
            contentUrl: "https://www.youtube.com/embed/5fb2aPlgoys",
            duration: 1300,
            isFree: false,
            order: 2,
            description:
              "Control the browser with JavaScript. Learn to select elements, respond to events, and update the page dynamically.",
          },
        ],
      },
      {
        id: "m1-3",
        courseId: "course-1",
        title: "React Framework",
        description: "Build modern UIs with the most popular JS framework.",
        order: 3,
        lessons: [
          {
            id: "l1-3-1",
            moduleId: "m1-3",
            title: "React Components & Props",
            type: "video",
            contentUrl: "https://www.youtube.com/embed/Rh3tobg7hEo",
            duration: 1400,
            isFree: false,
            order: 1,
            description:
              "Understand React's component model, JSX, and how to pass data with props.",
          },
          {
            id: "l1-3-2",
            moduleId: "m1-3",
            title: "State & Hooks",
            type: "video",
            contentUrl: "https://www.youtube.com/embed/O6P86uwfdR0",
            duration: 1200,
            isFree: false,
            order: 2,
            description:
              "Master useState, useEffect, and custom hooks to manage component state and side effects.",
          },
        ],
      },
    ],
  },
  {
    id: "course-2",
    title: "Python for Data Science & Machine Learning",
    shortDescription:
      "From Python basics to advanced ML algorithms. Build real AI projects with scikit-learn and TensorFlow.",
    description:
      "Dive deep into Python programming with a focus on data science applications. This course covers NumPy, Pandas, Matplotlib, scikit-learn, and introduces deep learning with TensorFlow. You'll work on real datasets and build production-ready ML models.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=400&h=225&fit=crop",
    price: 3499,
    instructor: "Dr. Michael Chen",
    tags: ["Python", "Machine Learning", "Data Science", "TensorFlow"],
    category: "Data Science",
    level: "Intermediate",
    isPublished: true,
    rating: 4.9,
    reviewCount: 3621,
    totalDuration: 5400,
    modules: [
      {
        id: "m2-1",
        courseId: "course-2",
        title: "Python Foundations",
        description: "Core Python for data science work.",
        order: 1,
        lessons: [
          {
            id: "l2-1-1",
            moduleId: "m2-1",
            title: "Python Crash Course",
            type: "video",
            contentUrl: "https://www.youtube.com/embed/_uQrJ0TkZlc",
            duration: 1800,
            isFree: true,
            order: 1,
            description:
              "Quick introduction to Python syntax, data types, and core constructs needed for data science.",
          },
          {
            id: "l2-1-2",
            moduleId: "m2-1",
            title: "NumPy & Pandas Deep Dive",
            type: "video",
            contentUrl: "https://www.youtube.com/embed/vmEHCJofslg",
            duration: 2100,
            isFree: false,
            order: 2,
            description:
              "Master the essential data manipulation libraries used by every data scientist.",
          },
        ],
      },
      {
        id: "m2-2",
        courseId: "course-2",
        title: "Machine Learning Algorithms",
        description: "Supervised and unsupervised learning techniques.",
        order: 2,
        lessons: [
          {
            id: "l2-2-1",
            moduleId: "m2-2",
            title: "Linear & Logistic Regression",
            type: "video",
            contentUrl: "https://www.youtube.com/embed/AoeEHnj0bLs",
            duration: 1600,
            isFree: false,
            order: 1,
            description:
              "Understand the math and implementation of the most fundamental ML algorithms.",
          },
          {
            id: "l2-2-2",
            moduleId: "m2-2",
            title: "Decision Trees & Random Forests",
            type: "video",
            contentUrl: "https://www.youtube.com/embed/RmajweUFKvM",
            duration: 1400,
            isFree: false,
            order: 2,
            description:
              "Learn ensemble methods that power many real-world ML applications.",
          },
        ],
      },
    ],
  },
  {
    id: "course-3",
    title: "UI/UX Design Masterclass",
    shortDescription:
      "Learn design thinking, Figma, and user research to create stunning digital products.",
    description:
      "This course transforms you into a confident UI/UX designer. You'll learn the full design process from user research and wireframing to high-fidelity prototypes in Figma. Includes real-world case studies, design system creation, and portfolio projects.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400&h=225&fit=crop",
    price: 1999,
    instructor: "Emma Rodriguez",
    tags: ["UI Design", "UX Design", "Figma", "Prototyping"],
    category: "Design",
    level: "Beginner",
    isPublished: true,
    rating: 4.7,
    reviewCount: 1924,
    totalDuration: 3600,
    modules: [
      {
        id: "m3-1",
        courseId: "course-3",
        title: "Design Thinking & Research",
        description: "Learn the user-centred design process.",
        order: 1,
        lessons: [
          {
            id: "l3-1-1",
            moduleId: "m3-1",
            title: "Introduction to Design Thinking",
            type: "video",
            contentUrl: "https://www.youtube.com/embed/gHGN6hs2gZY",
            duration: 720,
            isFree: true,
            order: 1,
            description:
              "Explore the five stages of design thinking: empathise, define, ideate, prototype, and test.",
          },
          {
            id: "l3-1-2",
            moduleId: "m3-1",
            title: "User Research Methods",
            type: "video",
            contentUrl: "https://www.youtube.com/embed/Ovj4hFxko7c",
            duration: 960,
            isFree: false,
            order: 2,
            description:
              "Learn interviews, surveys, usability tests, and persona creation.",
          },
        ],
      },
      {
        id: "m3-2",
        courseId: "course-3",
        title: "Figma Mastery",
        description: "Build beautiful interfaces with Figma.",
        order: 2,
        lessons: [
          {
            id: "l3-2-1",
            moduleId: "m3-2",
            title: "Figma Essentials",
            type: "video",
            contentUrl: "https://www.youtube.com/embed/jk1T0CdLxwU",
            duration: 1200,
            isFree: false,
            order: 1,
            description:
              "Master frames, components, auto-layout, and the Figma workflow.",
          },
          {
            id: "l3-2-2",
            moduleId: "m3-2",
            title: "Design Systems & Components",
            type: "video",
            contentUrl: "https://www.youtube.com/embed/Dtd40cHQQlk",
            duration: 1440,
            isFree: false,
            order: 2,
            description:
              "Build scalable design systems with tokens, variants, and component libraries.",
          },
        ],
      },
    ],
  },
  {
    id: "course-4",
    title: "AWS Cloud Architecture & DevOps",
    shortDescription:
      "Deploy scalable applications using AWS services, Docker, Kubernetes, and CI/CD pipelines.",
    description:
      "Gain hands-on experience with AWS cloud services including EC2, S3, RDS, Lambda, and ECS. You'll learn Docker containerisation, Kubernetes orchestration, and how to build automated CI/CD pipelines using GitHub Actions. Includes real infrastructure projects.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=400&h=225&fit=crop",
    price: 4299,
    instructor: "James Patel",
    tags: ["AWS", "Docker", "Kubernetes", "DevOps", "CI/CD"],
    category: "Cloud & DevOps",
    level: "Advanced",
    isPublished: true,
    rating: 4.6,
    reviewCount: 1187,
    totalDuration: 6300,
    modules: [
      {
        id: "m4-1",
        courseId: "course-4",
        title: "AWS Core Services",
        description: "Master the essential AWS building blocks.",
        order: 1,
        lessons: [
          {
            id: "l4-1-1",
            moduleId: "m4-1",
            title: "AWS Introduction & IAM",
            type: "video",
            contentUrl: "https://www.youtube.com/embed/k1RI5locZE4",
            duration: 1200,
            isFree: true,
            order: 1,
            description:
              "Set up your AWS account, understand regions, availability zones, and IAM security best practices.",
          },
          {
            id: "l4-1-2",
            moduleId: "m4-1",
            title: "EC2, S3, and RDS Deep Dive",
            type: "video",
            contentUrl: "https://www.youtube.com/embed/3hLmDS179YE",
            duration: 2400,
            isFree: false,
            order: 2,
            description:
              "Configure EC2 instances, manage S3 buckets, and deploy RDS databases for production workloads.",
          },
        ],
      },
      {
        id: "m4-2",
        courseId: "course-4",
        title: "Containerisation with Docker",
        description: "Package applications for consistent deployment.",
        order: 2,
        lessons: [
          {
            id: "l4-2-1",
            moduleId: "m4-2",
            title: "Docker Fundamentals",
            type: "video",
            contentUrl: "https://www.youtube.com/embed/3c-iBn73dDE",
            duration: 1800,
            isFree: false,
            order: 1,
            description:
              "Build, run, and manage Docker containers. Write Dockerfiles and docker-compose configurations.",
          },
        ],
      },
    ],
  },
  {
    id: "course-5",
    title: "Financial Modelling & Excel Mastery",
    shortDescription:
      "Build professional financial models, DCF valuations, and investment analyses in Excel.",
    description:
      "Learn the exact financial modelling techniques used by investment bankers and analysts at top firms. This course covers 3-statement modelling, DCF valuation, LBO analysis, M&A models, and advanced Excel techniques including VBA macros.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=225&fit=crop",
    price: 3999,
    instructor: "Alex Morrison",
    tags: ["Finance", "Excel", "Valuation", "Investment Banking"],
    category: "Finance",
    level: "Intermediate",
    isPublished: true,
    rating: 4.8,
    reviewCount: 2103,
    totalDuration: 4800,
    modules: [
      {
        id: "m5-1",
        courseId: "course-5",
        title: "Excel Power User",
        description: "Advanced Excel for financial analysis.",
        order: 1,
        lessons: [
          {
            id: "l5-1-1",
            moduleId: "m5-1",
            title: "Excel Shortcuts & Formulas",
            type: "video",
            contentUrl: "https://www.youtube.com/embed/RdTozKPY_OQ",
            duration: 1500,
            isFree: true,
            order: 1,
            description:
              "Become a power user with essential shortcuts, VLOOKUP, INDEX/MATCH, and array formulas.",
          },
          {
            id: "l5-1-2",
            moduleId: "m5-1",
            title: "Pivot Tables & Charts",
            type: "video",
            contentUrl: "https://www.youtube.com/embed/9NUjHBNWe9M",
            duration: 1200,
            isFree: false,
            order: 2,
            description:
              "Analyse large datasets with pivot tables and create professional financial charts.",
          },
        ],
      },
      {
        id: "m5-2",
        courseId: "course-5",
        title: "DCF & Valuation Models",
        description: "Build industry-standard valuation models.",
        order: 2,
        lessons: [
          {
            id: "l5-2-1",
            moduleId: "m5-2",
            title: "Discounted Cash Flow Analysis",
            type: "video",
            contentUrl: "https://www.youtube.com/embed/MTFYWFnqNJI",
            duration: 1800,
            isFree: false,
            order: 1,
            description:
              "Build a complete DCF model from scratch including revenue projections, WACC, and terminal value.",
          },
        ],
      },
    ],
  },
  {
    id: "course-6",
    title: "iOS & Android App Development with Flutter",
    shortDescription:
      "Build beautiful cross-platform mobile apps using Flutter and Dart. Deploy to both app stores.",
    description:
      "Flutter is Google's UI toolkit for building natively compiled apps for mobile, web, and desktop from a single codebase. This course takes you from Dart fundamentals to building and publishing production apps on the App Store and Google Play.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=225&fit=crop",
    price: 2799,
    instructor: "Nina Sharma",
    tags: ["Flutter", "Dart", "iOS", "Android", "Mobile"],
    category: "Mobile Development",
    level: "Beginner",
    isPublished: true,
    rating: 4.7,
    reviewCount: 1456,
    totalDuration: 4500,
    modules: [
      {
        id: "m6-1",
        courseId: "course-6",
        title: "Dart Language Fundamentals",
        description: "Learn Dart before diving into Flutter.",
        order: 1,
        lessons: [
          {
            id: "l6-1-1",
            moduleId: "m6-1",
            title: "Dart Crash Course",
            type: "video",
            contentUrl: "https://www.youtube.com/embed/5xlVP04905w",
            duration: 1800,
            isFree: true,
            order: 1,
            description:
              "Get up to speed with Dart's syntax, null safety, classes, and async/await patterns.",
          },
          {
            id: "l6-1-2",
            moduleId: "m6-1",
            title: "OOP in Dart",
            type: "video",
            contentUrl: "https://www.youtube.com/embed/F3JuuYuOUK4",
            duration: 1200,
            isFree: false,
            order: 2,
            description:
              "Master object-oriented programming concepts: classes, inheritance, mixins, and generics.",
          },
        ],
      },
      {
        id: "m6-2",
        courseId: "course-6",
        title: "Flutter Widgets & UI",
        description: "Build stunning mobile interfaces.",
        order: 2,
        lessons: [
          {
            id: "l6-2-1",
            moduleId: "m6-2",
            title: "Flutter Widgets Deep Dive",
            type: "video",
            contentUrl: "https://www.youtube.com/embed/1gDhl4leEzA",
            duration: 1600,
            isFree: false,
            order: 1,
            description:
              "Understand stateless and stateful widgets. Build complex layouts with Row, Column, Stack, and ListView.",
          },
          {
            id: "l6-2-2",
            moduleId: "m6-2",
            title: "State Management with Provider",
            type: "video",
            contentUrl: "https://www.youtube.com/embed/d_m5csmrf7I",
            duration: 1400,
            isFree: false,
            order: 2,
            description:
              "Manage app-wide state efficiently using the Provider pattern and ChangeNotifier.",
          },
        ],
      },
    ],
  },
];

const SEED_QUIZZES: Record<string, QuizQuestion[]> = {
  "l1-1-1": [
    {
      id: "q1",
      lessonId: "l1-1-1",
      question: "What does HTML stand for?",
      type: "mcq",
      options: [
        "HyperText Markup Language",
        "HighText Machine Language",
        "HyperText Machine Language",
        "HyperLink Markup Language",
      ],
      correctIndex: 0,
    },
    {
      id: "q2",
      lessonId: "l1-1-1",
      question: "Which tag is used to define the largest heading in HTML?",
      type: "mcq",
      options: ["<heading>", "<h6>", "<h1>", "<head>"],
      correctIndex: 2,
    },
    {
      id: "q3",
      lessonId: "l1-1-1",
      question: "The tag used for a line break in HTML is ____.",
      type: "fill-blank",
      options: [],
      correctAnswer: "<br>",
    },
  ],
  "l2-1-1": [
    {
      id: "q4",
      lessonId: "l2-1-1",
      question: "Which of the following is NOT a Python data type?",
      type: "mcq",
      options: ["int", "float", "char", "bool"],
      correctIndex: 2,
    },
    {
      id: "q5",
      lessonId: "l2-1-1",
      question: "What does the len() function return for a list?",
      type: "mcq",
      options: [
        "The last element",
        "The number of elements",
        "The sum of elements",
        "The first element",
      ],
      correctIndex: 1,
    },
    {
      id: "q5b",
      lessonId: "l2-1-1",
      question: "Explain the difference between a list and a tuple in Python.",
      type: "short-answer",
      options: [],
    },
  ],
  "l3-1-1": [
    {
      id: "q6",
      lessonId: "l3-1-1",
      question: "What is the first stage of Design Thinking?",
      type: "mcq",
      options: ["Define", "Ideate", "Empathize", "Prototype"],
      correctIndex: 2,
    },
    {
      id: "q7",
      lessonId: "l3-1-1",
      question: "UX design primarily focuses on?",
      type: "mcq",
      options: [
        "Making things look beautiful",
        "Writing code efficiently",
        "The overall user experience and usability",
        "Marketing the product",
      ],
      correctIndex: 2,
    },
    {
      id: "q7b",
      lessonId: "l3-1-1",
      question: "The stage after ideation in Design Thinking is ____.",
      type: "fill-blank",
      options: [],
      correctAnswer: "prototype",
    },
  ],
};

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {
    /* ignore */
  }
  return fallback;
}

function save(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function CourseProvider({ children }: { children: React.ReactNode }) {
  const [courses, setCourses] = useState<Course[]>(() =>
    load<Course[]>(COURSES_KEY, SEED_COURSES),
  );
  const [purchases, setPurchases] = useState<Purchase[]>(() =>
    load<Purchase[]>(PURCHASES_KEY, []),
  );
  const [progressMap, setProgressMap] = useState<Record<string, Progress>>(() =>
    load(PROGRESS_KEY, {}),
  );
  const [comments, setComments] = useState<Comment[]>(() =>
    load<Comment[]>(COMMENTS_KEY, []),
  );
  const [quizzes, setQuizzes] = useState<Record<string, QuizQuestion[]>>(() =>
    load(QUIZ_KEY, SEED_QUIZZES),
  );
  const [quizSubmissions, setQuizSubmissions] = useState<
    Record<string, QuizSubmission>
  >(() => load(QUIZ_SUB_KEY, {}));
  const [certificates, setCertificates] = useState<Record<string, Certificate>>(
    () => load(CERTS_KEY, {}),
  );
  const [referralCodes, setReferralCodes] = useState<Record<string, string>>(
    () => load(REFERRAL_CODES_KEY, {}),
  );
  const [referralSettings, setReferralSettings] = useState<
    Record<string, ReferralSettings>
  >(() => load(REFERRAL_SETTINGS_KEY, {}));
  const [globalCommissionTiers, setGlobalCommissionTiers] = useState<
    CommissionTier[]
  >(() =>
    load(GLOBAL_COMMISSION_TIERS_KEY, [
      { minReferrals: 1, maxReferrals: 9, rate: 5 },
      { minReferrals: 10, maxReferrals: null, rate: 7 },
    ]),
  );
  const [referralRecords, setReferralRecords] = useState<ReferralRecord[]>(() =>
    load(REFERRAL_RECORDS_KEY, []),
  );
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(() =>
    load(WITHDRAWALS_KEY, []),
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    save(COURSES_KEY, courses);
  }, [courses]);
  useEffect(() => {
    save(PURCHASES_KEY, purchases);
  }, [purchases]);
  useEffect(() => {
    save(PROGRESS_KEY, progressMap);
  }, [progressMap]);
  useEffect(() => {
    save(COMMENTS_KEY, comments);
  }, [comments]);
  useEffect(() => {
    save(QUIZ_KEY, quizzes);
  }, [quizzes]);
  useEffect(() => {
    save(QUIZ_SUB_KEY, quizSubmissions);
  }, [quizSubmissions]);
  useEffect(() => {
    save(CERTS_KEY, certificates);
  }, [certificates]);
  useEffect(() => {
    save(REFERRAL_CODES_KEY, referralCodes);
  }, [referralCodes]);
  useEffect(() => {
    save(REFERRAL_SETTINGS_KEY, referralSettings);
  }, [referralSettings]);
  useEffect(() => {
    save(GLOBAL_COMMISSION_TIERS_KEY, globalCommissionTiers);
  }, [globalCommissionTiers]);
  useEffect(() => {
    save(REFERRAL_RECORDS_KEY, referralRecords);
  }, [referralRecords]);
  useEffect(() => {
    save(WITHDRAWALS_KEY, withdrawals);
  }, [withdrawals]);

  const getCourse = useCallback(
    (id: string) => courses.find((c) => c.id === id),
    [courses],
  );
  const getCourses = useCallback(() => courses, [courses]);

  const createCourse = useCallback(async (data: Omit<Course, "id">) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const newCourse: Course = { ...data, id: `course-${Date.now()}` };
    setCourses((prev) => [...prev, newCourse]);
    setIsLoading(false);
    return newCourse;
  }, []);

  const updateCourse = useCallback(
    async (id: string, data: Partial<Course>) => {
      setIsLoading(true);
      await new Promise((r) => setTimeout(r, 600));
      let updated: Course | undefined;
      setCourses((prev) =>
        prev.map((c) => {
          if (c.id === id) {
            updated = { ...c, ...data };
            return updated;
          }
          return c;
        }),
      );
      setIsLoading(false);
      if (!updated) throw new Error("Course not found");
      return updated;
    },
    [],
  );

  const deleteCourse = useCallback(async (id: string) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setCourses((prev) => prev.filter((c) => c.id !== id));
    setIsLoading(false);
  }, []);

  const purchaseCourse = useCallback(
    async (userId: string, courseId: string, referralCode?: string) => {
      await new Promise((r) => setTimeout(r, 1500));
      const newPurchase: Purchase = {
        userId,
        courseId,
        paymentId: `pay_${Date.now()}`,
        purchasedAt: new Date().toISOString(),
        referralCode,
      };
      setPurchases((prev) => [...prev, newPurchase]);

      // Track referral if code provided
      if (referralCode) {
        // Find referrer by code
        const storedCodes = load<Record<string, string>>(
          REFERRAL_CODES_KEY,
          {},
        );
        const referrerId = Object.entries(storedCodes).find(
          ([_, code]) => code === referralCode,
        )?.[0];
        if (referrerId && referrerId !== userId) {
          const course = courses.find((c) => c.id === courseId);
          if (course) {
            // Also check user's own referralCode from localStorage
            const storedUsers = JSON.parse(
              localStorage.getItem(USERS_KEY) || "[]",
            );
            const referrerUser = storedUsers.find(
              (u: { referralCode?: string; id: string }) =>
                u.referralCode === referralCode,
            );
            const actualReferrerId = referrerUser?.id || referrerId;
            if (actualReferrerId !== userId) {
              const settings = load<Record<string, ReferralSettings>>(
                REFERRAL_SETTINGS_KEY,
                {},
              );
              const courseSettings = settings[courseId] || {
                courseId,
                enabled: true,
                slabs: globalCommissionTiers,
              };
              if (courseSettings.enabled) {
                const existingRecords = load<ReferralRecord[]>(
                  REFERRAL_RECORDS_KEY,
                  [],
                );
                const referrerCount = existingRecords.filter(
                  (r) => r.referrerId === actualReferrerId,
                ).length;
                const slab =
                  courseSettings.slabs.findLast(
                    (s) => referrerCount + 1 >= s.minReferrals,
                  ) || courseSettings.slabs[0];
                const rate = slab?.rate ?? 5;
                const commission = Math.round((course.price * rate) / 100);
                const newRecord: ReferralRecord = {
                  id: `ref-${Date.now()}`,
                  referrerId: actualReferrerId,
                  refereeId: userId,
                  courseId,
                  commission,
                  status: "pending",
                  createdAt: new Date().toISOString(),
                };
                setReferralRecords((prev) => [...prev, newRecord]);
              }
            }
          }
        } else {
          // Try matching against user referral codes in auth storage
          const storedUsers = JSON.parse(
            localStorage.getItem(USERS_KEY) || "[]",
          );
          const referrerUser = storedUsers.find(
            (u: { referralCode?: string; id: string }) =>
              u.referralCode === referralCode,
          );
          if (referrerUser && referrerUser.id !== userId) {
            const course = courses.find((c) => c.id === courseId);
            if (course) {
              const settings = load<Record<string, ReferralSettings>>(
                REFERRAL_SETTINGS_KEY,
                {},
              );
              const courseSettings = settings[courseId] || {
                courseId,
                enabled: true,
                slabs: globalCommissionTiers,
              };
              if (courseSettings.enabled) {
                const existingRecords = load<ReferralRecord[]>(
                  REFERRAL_RECORDS_KEY,
                  [],
                );
                const referrerCount = existingRecords.filter(
                  (r) => r.referrerId === referrerUser.id,
                ).length;
                const slab =
                  courseSettings.slabs.findLast(
                    (s) => referrerCount + 1 >= s.minReferrals,
                  ) || courseSettings.slabs[0];
                const rate = slab?.rate ?? 5;
                const commission = Math.round((course.price * rate) / 100);
                const newRecord: ReferralRecord = {
                  id: `ref-${Date.now()}`,
                  referrerId: referrerUser.id,
                  refereeId: userId,
                  courseId,
                  commission,
                  status: "pending",
                  createdAt: new Date().toISOString(),
                };
                setReferralRecords((prev) => [...prev, newRecord]);
              }
            }
          }
        }
      }
    },
    [courses, globalCommissionTiers],
  );

  const getPurchases = useCallback(
    (userId: string) => purchases.filter((p) => p.userId === userId),
    [purchases],
  );

  const getAllPurchases = useCallback(() => purchases, [purchases]);

  const hasAccess = useCallback(
    (userId: string, courseId: string) =>
      purchases.some((p) => p.userId === userId && p.courseId === courseId),
    [purchases],
  );

  const getProgress = useCallback(
    (userId: string, courseId: string): Progress => {
      const key = `${userId}-${courseId}`;
      return progressMap[key] ?? { userId, courseId, completedLessons: [] };
    },
    [progressMap],
  );

  const markLessonComplete = useCallback(
    (userId: string, courseId: string, lessonId: string) => {
      const key = `${userId}-${courseId}`;
      setProgressMap((prev) => {
        const existing = prev[key] ?? {
          userId,
          courseId,
          completedLessons: [],
        };
        if (existing.completedLessons.includes(lessonId)) return prev;
        return {
          ...prev,
          [key]: {
            ...existing,
            completedLessons: [...existing.completedLessons, lessonId],
          },
        };
      });
    },
    [],
  );

  const addComment = useCallback(
    async (data: Omit<Comment, "id" | "createdAt">) => {
      await new Promise((r) => setTimeout(r, 600));
      const newComment: Comment = {
        ...data,
        id: `comment-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setComments((prev) => [...prev, newComment]);
      return newComment;
    },
    [],
  );

  const getComments = useCallback(
    (lessonId: string) => comments.filter((c) => c.lessonId === lessonId),
    [comments],
  );

  const getQuiz = useCallback(
    (lessonId: string) => quizzes[lessonId] ?? [],
    [quizzes],
  );

  const saveQuiz = useCallback(
    (lessonId: string, questions: QuizQuestion[]) => {
      setQuizzes((prev) => ({ ...prev, [lessonId]: questions }));
    },
    [],
  );

  const submitQuiz = useCallback(
    async (submission: Omit<QuizSubmission, "submittedAt">) => {
      await new Promise((r) => setTimeout(r, 600));
      const key = `${submission.userId}-${submission.lessonId}`;
      const full: QuizSubmission = {
        ...submission,
        submittedAt: new Date().toISOString(),
      };
      setQuizSubmissions((prev) => ({ ...prev, [key]: full }));
    },
    [],
  );

  const getQuizSubmission = useCallback(
    (userId: string, lessonId: string) => {
      const key = `${userId}-${lessonId}`;
      return quizSubmissions[key];
    },
    [quizSubmissions],
  );

  // Certificate
  const getCertificate = useCallback(
    (userId: string, courseId: string): Certificate | undefined => {
      const key = `${userId}-${courseId}`;
      return certificates[key];
    },
    [certificates],
  );

  const getCertificateById = useCallback(
    (certId: string): Certificate | undefined => {
      return Object.values(certificates).find((c) => c.id === certId);
    },
    [certificates],
  );

  const getUserCertificates = useCallback(
    (userId: string): Certificate[] => {
      return Object.values(certificates).filter((c) => c.userId === userId);
    },
    [certificates],
  );

  const generateCertificate = useCallback(
    (userId: string, courseId: string, userName: string): Certificate => {
      const key = `${userId}-${courseId}`;
      const existing = certificates[key];
      if (existing) return existing;
      const course = courses.find((c) => c.id === courseId);
      const cert: Certificate = {
        id: generateCertId(),
        userId,
        userName,
        courseId,
        courseName: course?.title ?? "Course",
        instructor: course?.instructor ?? "Instructor",
        completionDate: new Date().toISOString().split("T")[0],
        issuedAt: new Date().toISOString(),
      };
      setCertificates((prev) => ({ ...prev, [key]: cert }));
      return cert;
    },
    [certificates, courses],
  );

  // Referral
  const getUserReferralCode = useCallback(
    (userId: string): string => {
      if (referralCodes[userId]) return referralCodes[userId];
      // Check user's own referralCode from AuthContext storage
      const storedUsers = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
      const user = storedUsers.find(
        (u: { id: string; referralCode?: string }) => u.id === userId,
      );
      if (user?.referralCode) {
        setReferralCodes((prev) => ({ ...prev, [userId]: user.referralCode }));
        return user.referralCode;
      }
      const code = Array.from({ length: 8 }, () =>
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".charAt(
          Math.floor(Math.random() * 36),
        ),
      ).join("");
      setReferralCodes((prev) => ({ ...prev, [userId]: code }));
      return code;
    },
    [referralCodes],
  );

  const getReferralSettings = useCallback(
    (courseId: string): ReferralSettings => {
      return (
        referralSettings[courseId] ?? {
          courseId,
          enabled: true,
          slabs: globalCommissionTiers,
        }
      );
    },
    [referralSettings, globalCommissionTiers],
  );

  const updateReferralSettings = useCallback((settings: ReferralSettings) => {
    setReferralSettings((prev) => ({ ...prev, [settings.courseId]: settings }));
  }, []);

  const getGlobalCommissionTiers = useCallback(
    () => globalCommissionTiers,
    [globalCommissionTiers],
  );
  const updateGlobalCommissionTiers = useCallback((tiers: CommissionTier[]) => {
    setGlobalCommissionTiers(tiers);
  }, []);

  const trackReferral = useCallback(
    (
      referrerId: string,
      refereeId: string,
      courseId: string,
      coursePrice: number,
    ) => {
      const settings = referralSettings[courseId] ?? {
        courseId,
        enabled: true,
        slabs: globalCommissionTiers,
      };
      if (!settings.enabled) return;
      const referrerCount = referralRecords.filter(
        (r) => r.referrerId === referrerId,
      ).length;
      const slab =
        settings.slabs.findLast((s) => referrerCount + 1 >= s.minReferrals) ||
        settings.slabs[0];
      const rate = slab?.rate ?? 5;
      const commission = Math.round((coursePrice * rate) / 100);
      const newRecord: ReferralRecord = {
        id: `ref-${Date.now()}`,
        referrerId,
        refereeId,
        courseId,
        commission,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      setReferralRecords((prev) => [...prev, newRecord]);
    },
    [referralRecords, referralSettings, globalCommissionTiers],
  );

  const getUserReferrals = useCallback(
    (userId: string): ReferralRecord[] => {
      return referralRecords.filter((r) => r.referrerId === userId);
    },
    [referralRecords],
  );

  const getUserEarnings = useCallback(
    (userId: string) => {
      const records = referralRecords.filter((r) => r.referrerId === userId);
      const total = records.reduce((acc, r) => acc + r.commission, 0);
      const pending = records
        .filter((r) => r.status === "pending")
        .reduce((acc, r) => acc + r.commission, 0);
      const paid = records
        .filter((r) => r.status === "paid")
        .reduce((acc, r) => acc + r.commission, 0);
      return { total, pending, paid };
    },
    [referralRecords],
  );

  const requestWithdrawal = useCallback(
    async (userId: string, upiId: string, amount: number) => {
      await new Promise((r) => setTimeout(r, 800));
      const newWithdrawal: Withdrawal = {
        id: `wd-${Date.now()}`,
        userId,
        upiId,
        amount,
        status: "pending",
        requestedAt: new Date().toISOString(),
      };
      setWithdrawals((prev) => [...prev, newWithdrawal]);
    },
    [],
  );

  const getUserWithdrawals = useCallback(
    (userId: string): Withdrawal[] => {
      return withdrawals.filter((w) => w.userId === userId);
    },
    [withdrawals],
  );

  const getAllWithdrawals = useCallback(
    (): Withdrawal[] => withdrawals,
    [withdrawals],
  );

  const updateWithdrawalStatus = useCallback(
    (id: string, status: "pending" | "paid") => {
      setWithdrawals((prev) =>
        prev.map((w) => (w.id === id ? { ...w, status } : w)),
      );
    },
    [],
  );

  const getAllUsers = useCallback((): User[] => {
    const stored = localStorage.getItem(USERS_KEY);
    if (!stored) return [];
    try {
      return (JSON.parse(stored) as Array<{ password?: string } & User>).map(
        ({ password: _p, ...u }) => u,
      );
    } catch {
      return [];
    }
  }, []);

  const getAllReferralRecords = useCallback(
    (): ReferralRecord[] => referralRecords,
    [referralRecords],
  );

  return (
    <CourseContext.Provider
      value={{
        courses,
        isLoading,
        getCourse,
        getCourses,
        createCourse,
        updateCourse,
        deleteCourse,
        purchaseCourse,
        getPurchases,
        hasAccess,
        getProgress,
        markLessonComplete,
        addComment,
        getComments,
        getQuiz,
        saveQuiz,
        submitQuiz,
        getQuizSubmission,
        getAllPurchases,
        getCertificate,
        getCertificateById,
        getUserCertificates,
        generateCertificate,
        getUserReferralCode,
        getReferralSettings,
        updateReferralSettings,
        trackReferral,
        getUserReferrals,
        getUserEarnings,
        requestWithdrawal,
        getUserWithdrawals,
        getAllWithdrawals,
        updateWithdrawalStatus,
        getAllUsers,
        getAllReferralRecords,
        getGlobalCommissionTiers,
        updateGlobalCommissionTiers,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
}

export function useCourses() {
  const ctx = useContext(CourseContext);
  if (!ctx) throw new Error("useCourses must be used within CourseProvider");
  return ctx;
}
