const SURGE_RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["predictedPatientLoad", "surgeLevel", "reasoning", "recommendations"],
  properties: {
    predictedPatientLoad: {
      type: "number",
      description: "Total expected patient inflow for the next day",
      minimum: 0
    },
    surgeLevel: {
      type: "string",
      enum: ["LOW", "MEDIUM", "HIGH"],
      description: "Overall surge classification"
    },
    reasoning: {
      type: "string",
      description: "Short explanation of what signals drove the prediction",
      maxLength: 400
    },
    recommendations: {
      type: "array",
      minItems: 3,
      maxItems: 6,
      items: {
        type: "string"
      },
      description: "Actionable hospital preparation steps"
    }
  }
};

const PROMPT_TEMPLATE = `
You are an on-call hospital operations analyst.
Analyze the provided hospital history and environment signals.
Respond ONLY with JSON that strictly matches the provided schema.
Do not explain, do not add markdown, and do not leave the schema.

SCHEMA:
{{SCHEMA}}

INPUT PAYLOAD (read-only):
{{PAYLOAD}}

Return JSON only.`.trim();

let GoogleGenerativeAI = null;

class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("⚠️ GEMINI_API_KEY is missing. Gemini predictions disabled.");
      this.disabled = true;
      return;
    }

    this.disabled = false;
    this.model = null;
    this.modelId = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  }

  async ensureModel() {
    if (this.disabled || this.model) {
      return;
    }

    if (!GoogleGenerativeAI) {
      ({ GoogleGenerativeAI } = await import("@google/generative-ai"));
    }

    const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = client.getGenerativeModel({
      model: this.modelId,
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        responseMimeType: "application/json",
        responseSchema: SURGE_RESPONSE_SCHEMA
      }
    });
  }

  async predictSurge(payload) {
    if (this.disabled) {
      throw new Error("Gemini disabled");
    }

    await this.ensureModel();

    if (!this.model) {
      throw new Error("Gemini model unavailable");
    }

    const prompt = PROMPT_TEMPLATE.replace(
      "{{SCHEMA}}",
      JSON.stringify(SURGE_RESPONSE_SCHEMA, null, 2)
    ).replace("{{PAYLOAD}}", JSON.stringify(payload, null, 2));

    const result = await this.model.generateContent(prompt);
    const text = result.response?.text?.();

    if (!text) {
      throw new Error("Empty Gemini response");
    }

    return JSON.parse(text);
  }
}

const geminiService = new GeminiService();

module.exports = {
  geminiService,
  SURGE_RESPONSE_SCHEMA,
  PROMPT_TEMPLATE
};

