import React, { useEffect, useState } from 'react';

function App() {
  const [products, setProducts] = useState([]);

  const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5YzUwMDJkMGQ2NzEwOTAxYWY3Zjg4YSIsImlhdCI6MTc3NDUxODQxNX0.uoC6saP3-H4m5zISFWypEf8CTyZFVo3wm-qi_31TISg";

  // 🔹 Fetch Products
  useEffect(() => {
    fetch('http://localhost:5000/api/products', {
      headers: {
        Authorization: `Bearer ${TOKEN}`
      }
    })
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.log(err));
  }, []);

  // 🔹 Place Order
  const placeOrder = async (product) => {
    try {
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TOKEN}`
        },
        body: JSON.stringify({
          products: [product],
          totalAmount: product.price
        })
      });

      const data = await res.json();
      alert(data.message || "Order placed!");
    } catch (err) {
      console.log(err);
      alert("Error placing order");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Products</h1>

      {products.map((p) => (
        <div key={p._id} style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}>
          <h3>{p.name}</h3>
          <p>Price: ₹{p.price}</p>

          <button onClick={() => placeOrder(p)}>
            Buy
          </button>
        </div>
      ))}
    </div>
  );
}

export default App;