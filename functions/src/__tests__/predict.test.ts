import {predictHandler} from "../handlers/predict";
import * as functions from "firebase-functions";

// Mock dependencies
jest.mock("../utils/auth");
jest.mock("../utils/rateLimiter");
jest.mock("../utils/mlModel");
jest.mock("firebase-admin", () => ({
  initializeApp: jest.fn(),
  firestore: () => ({
    collection: () => ({
      doc: () => ({
        set: jest.fn(),
      }),
    }),
    FieldValue: {
      serverTimestamp: () => new Date(),
    },
  }),
}));

describe("predictHandler", () => {
  const mockContext: functions.https.CallableContext = {
    auth: {
      uid: "test-user-id",
    },
    rawRequest: {
      ip: "127.0.0.1",
    },
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should validate input and return prediction", async () => {
    const {verifyAuth} = require("../utils/auth");
    const {checkRateLimit} = require("../utils/rateLimiter");
    const {predictPCOSRisk} = require("../utils/mlModel");

    verifyAuth.mockResolvedValue("test-user-id");
    checkRateLimit.mockResolvedValue(undefined);
    predictPCOSRisk.mockResolvedValue({
      label: "Early",
      probabilities: {NoRisk: 0.2, Early: 0.6, High: 0.2},
      topContributors: [
        {feature: "BMI", contribution: 0.3, explanation: "Test"},
      ],
    });

    const result = await predictHandler(
      {
        age: 28,
        weight: 65,
        height: 165,
        cycleRegularity: "irregular",
        exerciseFrequency: "1-2_week",
        diet: "balanced",
      },
      mockContext
    );

    expect(result).toHaveProperty("label");
    expect(result).toHaveProperty("probabilities");
    expect(result).toHaveProperty("topContributors");
  });
});

