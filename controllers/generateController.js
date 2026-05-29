import OpenAI from "openai"
import 'dotenv/config';
import { InferenceClient } from "@huggingface/inference";


const openai = new OpenAI({
  apiKey: process.env.AI_KEY,
  baseURL: process.env.AI_URL,
})

const client = new InferenceClient(process.env.HF_TOKEN);

export async function refine(req,res){
const userPrompt = req.body.description

try {

  const messages = [{
    role: "system",
    content: "You are an expert at writing image generation prompts. Take the user's description and refine it into a detailed, vivid image generation prompt."
},

{
    role: "user",
    content: userPrompt
}
]

const response = await openai.chat.completions.create({
  model: process.env.AI_MODEL,
  messages:  messages 

})

const result = response.choices[0].message.content
res.json({refinedPrompt : result})

}catch(err){
res.status(500).json({error : err})
}}


export async function image(req,res){
const result = req.body.prompt
console.log('image called, prompt:', result)


try{

    const imageBlob = await client.textToImage({
    provider: "hf-inference",
    model: "black-forest-labs/FLUX.1-schnell",
    inputs: result,
    parameters: { num_inference_steps: 5 }
  });

  const arrayBuffer = await imageBlob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const imageUrl = `data:image/png;base64,${buffer.toString('base64')}`;
  res.json({ imageUrl });
}
catch(err){
    res.status(500).json({error : err})
}}