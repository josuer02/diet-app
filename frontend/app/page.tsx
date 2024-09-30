"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DietPlan {
  id: number;
  name: string;
  description: string;
  calories: number;
}

export default function Home() {
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [calories, setCalories] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDietPlans();
  }, []);

  const fetchDietPlans = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:3001/api/diet-plans");
      if (!response.ok) {
        throw new Error("Failed to fetch diet plans");
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setDietPlans(data);
      } else {
        throw new Error("Received data is not an array");
      }
    } catch (error) {
      console.error("Error fetching diet plans:", error);
      setError("Failed to load diet plans. Please try again later.");
      setDietPlans([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (editingId) {
        await handleUpdate(editingId);
      } else {
        await handleCreate();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setError("Failed to save diet plan. Please try again.");
    }
  };

  const handleCreate = async () => {
    const response = await fetch("http://localhost:3001/api/diet-plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, calories: parseInt(calories) }),
    });
    if (!response.ok) {
      throw new Error("Failed to create diet plan");
    }
    resetForm();
    await fetchDietPlans();
  };

  const handleUpdate = async (id: number) => {
    const response = await fetch(`http://localhost:3001/api/diet-plans/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, calories: parseInt(calories) }),
    });
    if (!response.ok) {
      throw new Error("Failed to update diet plan");
    }
    resetForm();
    await fetchDietPlans();
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/diet-plans/${id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete diet plan");
      }
      await fetchDietPlans();
    } catch (error) {
      console.error("Error deleting diet plan:", error);
      setError("Failed to delete diet plan. Please try again.");
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setCalories("");
    setEditingId(null);
  };

  const startEditing = (plan: DietPlan) => {
    setEditingId(plan.id);
    setName(plan.name);
    setDescription(plan.description);
    setCalories(plan.calories.toString());
  };

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Diet Plan Manager</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="mb-8">
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Diet Plan Name"
          className="mb-2"
        />
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="mb-2"
        />
        <Input
          type="number"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
          placeholder="Calories"
          className="mb-2"
        />
        <Button type="submit">{editingId ? "Update" : "Add"} Diet Plan</Button>
        {editingId && (
          <Button type="button" onClick={resetForm} className="ml-2">
            Cancel
          </Button>
        )}
      </form>
      {isLoading ? (
        <p>Loading diet plans...</p>
      ) : dietPlans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dietPlans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{plan.description}</p>
                <p>Calories: {plan.calories}</p>
                <div className="mt-4">
                  <Button onClick={() => startEditing(plan)} className="mr-2">
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(plan.id)}
                    variant="destructive"
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p>No diet plans found.</p>
      )}
    </main>
  );
}
