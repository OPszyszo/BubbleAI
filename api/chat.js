export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Method not allowed" });
  }

  const { message, model } = req.body;

  if (!message) {
    return res.status(400).json({ reply: "Brak wiadomości" });
  }

  try {
    let reply = "";

    if (model === "bubble1") {
      // Bubble 1.4 – twoje zewnętrzne API
      const response = await fetch("https://bubble-ai-ivory.vercel.app/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await response.json();
      reply = data.reply || "Brak odpowiedzi z Bubble 1.4";
    } 
    else if (model === "bubble2") {
      const GROQ_API_KEY = process.env.GROQ_API_KEY;
      if (!GROQ_API_KEY) {
        throw new Error("Brak klucza GROQ_API_KEY");
      }
      const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: "Jesteś Bubble 2.1, asystentem AI. Odpowiadasz po polsku." },
            { role: "user", content: message },
          ],
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });
      const data = await groqResponse.json();
      if (data.error) throw new Error(data.error.message);
      reply = data.choices?.[0]?.message?.content || "Brak odpowiedzi z Groq";
    } 
    else {
      // Jeśli model nie jest rozpoznany
      return res.status(400).json({ reply: "Nieznany model – wybierz Bubble 1.4 lub 2.1" });
    }

    res.status(200).json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Błąd serwera: " + err.message });
  }
}
