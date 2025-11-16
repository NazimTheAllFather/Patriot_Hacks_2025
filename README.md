<p align="center" style="margin-bottom: 0;">
  <img src="./logo_real.png" alt="Safefier Logo" width="100%"/>
</p>

<p align="center" style="margin-top: 0;">
  <strong>"Even AI needs a responsible parent"</strong>
</p>

## Setup

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

### Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

### Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

### Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.




## Brief Technical Review 

This section covers a summary of the technical aspects of our project. 
### The Problem
Conversational AIs and chatbots are **ubiquitous**; whether it is for customers who would like to express

their concerns about their orders through the Uber Eats app, or a user placing a job application at Hot

Topic, with the help of built-in AI agents and customer service chatbots, consumers and workers alike

can expedite and automate the process of common questions and issues, with little-to-no human

supervision.

While these systems tend to be more convenient and efficient, they also introduce serious safety gaps

that can lead to psychological harm, legal liability, and the erosion of trust when it comes to AI-first

companies and technologies. According to **Ars Technica** (Belanger, 2025), a professional technology

news publication founded in 1998 by Condé Nast, a lawsuit was filed in August against OpenAI, in

response to ChatGPT *allegedly* assisting a teenager in writing his own suicide note. The teenager then

committed suicide.

### Our solution
**Safefier** acts like a “responsible parent” for AI chatbots. Instead of replacing a chatbot, it sits between

the user and the AI and shows how unsafe responses could be intercepted and replaced.

In our demo, a user types a message, sees how a normal chatbot might reply, and then sees how

Safefier would step in. Safefier’s logic applies simple safety rules to the AI response and then either

keeps it as-is or turns it into a safer alternative. The goal is to show how a lightweight safety layer can

reduce harm while still letting companies use AI tools.

### How it works
1. The user opens the Safefier demo and types a message into the chat box.

2. The app generates a “regular” chatbot-style reply.

3. Behind the scences, that reply is then passed through Safefier’s safety logic inside our Next.js code.

4. If the reply looks safe, it is shown normally.

5. If it triggers one of our safety detectors, either Crisis/support resources are shown are the user is presented with option
   to talk to a human agent.
6. A before/after effect so people can see what Safefier changed.

### How we built it
For the hackathon, we built Safefier as a web-based demo that shows what a “responsible parent” for AI

could look like in practice. On the front end, we used Next.js with TypeScript and

JavaScript to handle the main app logic, and Tailwind CSS for styling so we could move quickly

without spending too much time on custom CSS.

On the back end, we implemented three core safety detection systems using FastAPI with Python
**Hallucination Detection**: We built a simple RAG to detect potential hallucinations with a specific dataset using wikipedia's api. 

To detect hallucinations we used a two tier flagging system, where the bot's response will be flagged for consistency first and 

Afterwards for groundedness in the Vector database we built. 

**Emotional Dependence Detection**: We implemented pattern matching with VADER sentiment analysis to detect concerning emotional attachment patterns. The system tracks signals like over-reliance, isolation indicators, and crisis language, assigning risk scores to determine when to intervene.

**Dangerous Advice Detection**: We integrated Google Gemini AI to analyze responses in real-time for harmful content across domains (i.e. medical, financial, psycological). Responses are scored for severity and blocked or flagged based on risk level. 

We added comprehensive privacy protections including SHA-256 user ID anonymization, zero message storage (analysis only), and safety & privacy notice that appears to the user before any chat ensues. Transparent dialogue is also included to make sure user's are aware of the privacy protections we have in place. 

The interface lets a user type a message, see how a normal chatbot might reply, and then see how

Safefier would intervene and provide a safer alternative. Our logic for the demo is implemented directly

in the Next.js code, where we add simple rule-based checks and example transformations to simulate

how a safety layer would filter and adjust responses. We used GitHub to collaborate on the code

and Vercel to host the Next.js app so the demo can be accessed through a single shareable link.

### Challenges we ran into
- Deciding how much of the safety logic to implement in a weekend.
- The hackathon usual suspects:
   - Debugging UI state
     
   - Getting Tailwind classes to behave the way we wanted
     
   - Ensuring the pages looked consistent on different screen sizes
     
   - Keeping the deployed version on Vercel up to date, while everyone was pushing commits
     
   - For some of us, Learning how to build RAGs
- One of us had an alergic reaction and had to rush to the hospital during development :(((
- Some of us had to juggle work, exams with their responsibilites on our project :(((


### Accomplishments that we're proud of
- We are proud that:
  
  -  We were able to form a team quickly around an idea and move towards delivering a product.
    
  -  We turned an abstract idea "AI needs safeguards" into a concrete, showcaseable demo.
    
  -  How polished the frontend feels given the time limit.
    
  -  How Adequately our backend behaves in detecting hallucinations, dangerous advice and emotional dependence.  

### What we learned
We learned how important it is to think about AI safety from both a technical and human perspective.

Even in a simplified demo, we had to ask questions like: What counts as “unsafe”? How should the

system respond to someone in distress? How do we avoid over-censoring while still protecting users?

On the technical side, we gained more experience with the Next.js and TypeScript stack, learned how to

structure a small project so multiple people can work on it, and practiced using GitHub for collaboration

and Vercel for quick deployments. We also saw how useful it is to prototype ideas visually instead of

keeping them only in documents. 

And of course, we learned about the importance of having a competent team when building a product

where each member has different expertise and experiences in front-end and back-end. 

### What's next for Safefier
Next, we would like to move from simulated checks to deeper safety integrations. That could include

connecting Safefier to real moderation APIs, expanding the rules to handle more nuanced scenarios,

and logging flagged messages for review.

We also want to build an admin or dashboard view where organizations can customize their own safety

policies, see statistics on what is being blocked or rewritten, and fine-tune the level of strictness. In the

long term, our goal is for Safefier to become a small, plug-in safety layer that can sit in front of many

different chatbots and make AI interactions safer by default.

