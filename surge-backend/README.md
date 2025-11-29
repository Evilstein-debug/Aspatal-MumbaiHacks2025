## Surge Forecasting Service

End-to-end Node.js + Express microservice that powers the predictive hospital surge dashboard. It uses MongoDB for historical data, Gemini for advanced forecasts, and falls back to a deterministic model if the LLM is unavailable.

### Prerequisites

- Node.js 18+
- MongoDB instance
- Gemini API key (`GEMINI_API_KEY`)

### Setup

```bash
cd surge-backend
cp env.sample .env            # populate with real values
npm install
npm run seed                  # generates CSV + seeds Mongo
npm run dev                   # starts the Express server on port 9000
```

### Environment variables

| Key | Description |
| --- | --- |
| `PORT` | HTTP port (default `9000`) |
| `MONGODB_URI` | Mongo connection string |
| `GEMINI_API_KEY` | Google Gemini API key |
| `GEMINI_MODEL` | Optional custom Gemini model |
| `AQI_API_URL` | Optional AQI REST endpoint (supports `{{CITY}}` + `{{API_KEY}}` tokens) |
| `AQI_API_KEY` | Token for the AQI provider |
| `AQI_DEFAULT_CITY` | City name used when simulating AQI |
| `DEFAULT_HOSPITAL_ID` | Hospital identifier for seed + predictions |

### Mock data generation

- `npm run seed` creates a 30-day timeline with:
  - Festival spikes (Ganesh Chaturthi, Diwali, Guru Nanak Jayanti, etc.)
  - Pollution events with AQI swings
  - Weekend dips and random jitter
- The script exports the dataset to `data/hospital_history.csv` and upserts it into MongoDB.

### API

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/surge/forecast?hospitalId=aspatal-mumbai` | Returns the latest prediction, trailing history window, AQI, festival proximity, and recommended actions. |

### Gemini integration

- `src/services/geminiService.js` encapsulates the prompt, JSON schema, and model call.
- Responses are constrained via `responseSchema` + `responseMimeType="application/json"` to prevent natural language leakage.
- If Gemini is down or returns invalid JSON, the service gracefully falls back to a rules-based predictor that blends rolling averages, AQI impact, and festival modifiers.

### Project structure

```
surge-backend/
├── data/                       # exported CSV files
├── scripts/                    # seeding + data generation
├── src/
│   ├── config/                 # Mongo connector
│   ├── controllers/            # Express route handlers
│   ├── models/                 # HospitalStat schema
│   ├── routes/                 # API routes
│   ├── services/               # Gemini, AQI, prediction logic
│   └── utils/                  # Festival calendar helpers
└── env.sample
```


