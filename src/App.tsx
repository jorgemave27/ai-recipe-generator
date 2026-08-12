import { useState } from "react";
import type { FormEvent } from "react";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../amplify/data/resource";
import outputs from "../amplify_outputs.json";
import "./App.css";

Amplify.configure(outputs);

const client = generateClient<Schema>({
  authMode: "userPool",
});

function App() {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function generateRecipe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setResult("");

    try {
      const formData = new FormData(event.currentTarget);
      const ingredients =
        formData.get("ingredients")?.toString() ?? "";

      const response = await client.queries.askBedrock({
        ingredients: [ingredients],
      });

      if (response.errors?.length) {
        setResult(
          response.errors.map((error) => error.message).join("\n")
        );
      } else {
        setResult(response.data?.body ?? "No recipe returned.");
      }
    } catch (error) {
      setResult(
        error instanceof Error ? error.message : String(error)
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-container">
      <div className="header-container">
        <h1 className="main-header">
          Meet Your Personal
          <br />
          <span className="highlight">Recipe AI</span>
        </h1>

        <p className="description">
          Enter a few ingredients separated by commas and generate a recipe
          with Amazon Bedrock.
        </p>
      </div>

      <form onSubmit={generateRecipe} className="form-container">
        <div className="search-container">
          <input
            type="text"
            name="ingredients"
            className="wide-input"
            placeholder="Chicken, rice, tomato, onion..."
          />

          <button
            type="submit"
            className="search-button"
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>
      </form>

      {result && (
        <div className="result-container">
          <p className="result">{result}</p>
        </div>
      )}
    </div>
  );
}

export default App;
