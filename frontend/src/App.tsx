import { useEffect, useState } from "react";
import axios from "axios";
import { io, Socket } from "socket.io-client";
import type { Dish } from "./types";

function App() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDishes = async () => {
      try {
        const res = await axios.get<Dish[]>("http://localhost:8000/api/dishes");
        setDishes(res.data);
      } catch (error) {
        console.error("Error fetching dishes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDishes();

    // Initialize Socket.IO
    const socket: Socket = io("http://localhost:8000");

    socket.on("connect", () => {
      console.log("Connected to Socket.IO server");
    });

    socket.on("dishUpdated", () => {
      console.log("Dish updated event received");
      fetchDishes(); // Re-fetch the updated list
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const toggleDish = async (dish: Dish) => {
    try {
      await axios.patch(`http://localhost:8000/api/dishes/${dish._id}/toggle`);
      // Optimistic UI update
      setDishes((prev) =>
        prev.map((d) =>
          d._id === dish._id ? { ...d, isPublished: !d.isPublished } : d
        )
      );
    } catch (error) {
      console.error("Error toggling dish:", error);
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Dish Dashboard</h1>
      {loading ? (
        <p>Loading dishes...</p>
      ) : (
        <div
          style={{
            display: "grid",
            gap: "1rem",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          }}
        >
          {dishes.map((dish) => (
            <div
              key={dish._id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "1rem",
                textAlign: "center",
                // opacity: dish.isPublished ? 1 : 0.5,
                // transition: "opacity 0.3s ease"
              }}
            >
              <img
                src={dish.imageUrl}
                alt={dish.dishName}
                style={{
                  width: "100%",
                  borderRadius: "4px",
                  opacity: dish.isPublished ? 1 : 0.4, // 👈 Only image faded
                  filter: dish.isPublished ? "none" : "grayscale(80%)",
                  transition: "opacity 0.3s ease"
                }}
              />
              <h3

                style={{
                  opacity: dish.isPublished ? 1 : 0.4,
                  transition: "opacity 0.3s ease"
                }}
              >{dish.dishName}


              </h3>
              <button
                onClick={() => toggleDish(dish)}
                style={dish.isPublished
                  ? {
                    color: "black",
                    border: "none",
                    padding: "0.5rem 1rem",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }
                  : {
                    backgroundColor: "#4caf50",
                    color: "white",
                    border: "none",
                    padding: "0.5rem 1rem",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
              >
                {dish.isPublished ? "Unpublish" : "Publish"}
              </button>
            </div>
          ))}


        </div>
      )}
    </div>
  );
}

export default App;
