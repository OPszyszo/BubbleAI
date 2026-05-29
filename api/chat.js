export default async function handler(req, res) {

    if(req.method !== "POST"){

        return res.status(405).json({
            reply:"Method not allowed"
        });

    }

    try {

        const groqResponse = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method:"POST",

                headers:{
                    "Authorization":
                    `Bearer ${process.env.GROQ_API_KEY}`,

                    "Content-Type":
                    "application/json"
                },

                body:JSON.stringify({

                    model:
                    "llama-3.3-70b-versatile",

                    messages:[
                        {
                            role:"system",
                            content:
                            "You are Bubble-1.4, a futuristic AI assistant."
                        },

                        {
                            role:"user",
                            content:req.body.message
                        }
                    ],

                    temperature:0.7,
                    max_tokens:1024

                })

            }
        );

        const data =
        await groqResponse.json();

        console.log(data);

        if(data.error){

            return res.status(500).json({
                reply:
                data.error.message
            });

        }

        const reply =
        data.choices?.[0]?.message?.content;

        res.status(200).json({

            reply:
            reply || "Empty response"

        });

    } catch(err){

        console.error(err);

        res.status(500).json({
            reply:"Server crashed"
        });

    }

}
