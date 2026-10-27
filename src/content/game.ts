import type { GameDefinition } from '../engine/types';

/** Verified source: 245-page A5 PDF. Only PDF line wraps, zero-width layout spaces, and folios are removed. */
export const MANUSCRIPT_SOURCE = {
  "title": "Roll For Profit: The Start Up Phase (A5 Print Version)",
  "pageCount": 245,
  "sha256": "145b34277d44ac043a0ea12a69117032dc5b53b06bda2f959974c21efcf7e9e9",
  "fileName": "Roll For Profit_ The Start Up Phase (A5 Print Version) (2).pdf"
} as const;

export const PLAYABLE_SECTION_IDS = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "24",
  "27",
  "31",
  "32",
  "33",
  "83",
  "84",
  "85",
  "280"
] as const;

export const PROTOTYPE_BOUNDARY_TARGETS = [
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "21",
  "22",
  "23",
  "25",
  "26",
  "28",
  "29",
  "30",
  "98",
  "99",
  "100",
  "101",
  "102",
  "103",
  "116",
  "117",
  "118",
  "119",
  "120",
  "122",
  "123",
  "124",
  "204",
  "227",
  "228"
] as const;

export const GAME: GameDefinition = {
  "id": "roll-for-profit-startup",
  "version": "1.0.0-prototype.1",
  "title": "Roll For Profit: The Startup Phase",
  "attributes": [
    {
      "key": "CR",
      "name": "Creativity",
      "description": "How innovative you are at generating new marketing ideas and strategies."
    },
    {
      "key": "TA",
      "name": "Tactics",
      "description": "Your ability to close deals, negotiate, and execute under pressure."
    },
    {
      "key": "RE",
      "name": "Resilience",
      "description": "How well you handle setbacks, criticism, and failure."
    },
    {
      "key": "NE",
      "name": "Networking",
      "description": "Your skill in forming connections, attracting influencers, and building partnerships."
    },
    {
      "key": "TS",
      "name": "Tech Savviness",
      "description": "Your ability to master online tools, funnels, and paid ads."
    }
  ],
  "initialCapital": 1000,
  "winCapital": 10000,
  "startSection": "1",
  "victorySection": "280",
  "scenes": {
    "1": {
      "id": "1",
      "heading": "The Call to Adventure",
      "paragraphs": [
        {
          "text": "The fluorescent lights of your office flicker above you, a constant reminder that you’re still here, trapped in the same lifeless cubicle, scrolling through social media while your boss thinks you're working on a quarterly report. Another entrepreneur just posted about making six figures in their sleep. Someone else launched a simple product that went viral overnight. And here you are, sipping cold coffee and wondering if there’s more to life than emails marked \"urgent\" that somehow never seem that urgent."
        },
        {
          "text": "Then, it hits you. You could do this too. You’ve got ideas. Maybe even a great one. What’s stopping you from launching your own business and taking control of your future? You sit up straighter, adrenaline buzzing through your veins. It’s time to make a move."
        },
        {
          "text": "What do you do next?"
        }
      ],
      "choices": [
        {
          "id": "1-to-2",
          "label": "Quit your job immediately and go all in!",
          "target": "2"
        },
        {
          "id": "1-to-3",
          "label": "Side hustle while keeping your job.",
          "target": "3"
        },
        {
          "id": "1-to-4",
          "label": "Buy a “Get Rich Quick” course from a guru.",
          "target": "4"
        }
      ],
      "illustration": "office",
      "sourcePages": [
        14
      ]
    },
    "2": {
      "id": "2",
      "heading": "The Leap of Faith",
      "paragraphs": [
        {
          "text": "You close your eyes, take a deep breath, and before you can talk yourself out of it, you do it. You draft the resignation email, hit send, and lean back in your chair. A wave of adrenaline rushes through you. No more bosses. No more meetings. No more wasted time."
        },
        {
          "text": "By the time you walk out of the office for the last time, reality starts creeping in. No more steady paycheck, either. You have savings, but it won’t last forever. Now, the clock is ticking."
        },
        {
          "text": "Back home, you sit in front of your laptop, staring at a blank screen. What’s your next move?"
        }
      ],
      "choices": [
        {
          "id": "2-to-5",
          "label": "Start building a website and brand identity right away.",
          "target": "5"
        },
        {
          "id": "2-to-6",
          "label": "Figure out who your audience is and what they actually need.",
          "target": "6"
        },
        {
          "id": "2-to-7",
          "label": "Go straight into selling something, figure out the details later.",
          "target": "7"
        }
      ],
      "illustration": "home",
      "sourcePages": [
        15
      ]
    },
    "3": {
      "id": "3",
      "heading": "The Cautious Climb",
      "paragraphs": [
        {
          "text": "You decide to play it safe. You’re not ready to give up the comfort of a steady paycheck just yet. Instead, you commit to working on your business during evenings and weekends. It’s going to be exhausting, but at least you won’t be homeless if things don’t work out."
        },
        {
          "text": "Each night after work, you pour over YouTube tutorials, marketing blogs, and startup success stories. You start making slow progress, sketching out your ideas and mapping out a plan. But balancing work and a side hustle isn’t easy. Your boss is starting to notice your decreased enthusiasm at work, and your social life? Well, let’s just say your favorite streaming service has started asking if you’re still alive."
        },
        {
          "text": "What’s your next step?"
        }
      ],
      "choices": [
        {
          "id": "3-to-8",
          "label": "Focus on learning and planning before taking any big risks.",
          "target": "8"
        },
        {
          "id": "3-to-9",
          "label": "Test the waters by offering a service or selling a small product.",
          "target": "9"
        },
        {
          "id": "3-to-10",
          "label": "Take out a small loan to speed up the process.",
          "target": "10"
        }
      ],
      "illustration": "home",
      "sourcePages": [
        15,
        16
      ]
    },
    "4": {
      "id": "4",
      "heading": "The Shortcut Gamble",
      "paragraphs": [
        {
          "text": "Scrolling through social media, you stumble across an ad that practically screams at you: “Make $10K a month with my secret business blueprint!” The guru in the video stands in front of a rented Lamborghini, flashing screenshots of massive earnings. It looks… suspiciously easy. But hey, what if it actually works?"
        },
        {
          "text": "You hover over the Buy Now button. For just $997, you could unlock the “secrets” to wealth. But do you even have that kind of money to spare?"
        },
        {
          "text": "If you don't have enough Capital, you hesitate, realizing that throwing money at a random guru might not be the smartest move. Instead, you decide to:",
          "condition": {
            "kind": "flag",
            "key": "coursePurchased",
            "value": false
          }
        },
        {
          "text": "Otherwise, you take a deep breath and click.. For just $997, you could unlock the “secrets” to wealth. You take a deep breath and click.",
          "condition": {
            "kind": "flag",
            "key": "coursePurchased",
            "value": true
          }
        },
        {
          "text": "The next morning, you eagerly log into the course. Module 1: Mindset Training. Okay. Module 2: Believe in Yourself. Hmm. By Module 5, you realize you’ve just paid for a glorified motivational speech. The “business model” is vague at best, and the real “secret” seems to be… selling the same course to others.",
          "condition": {
            "kind": "flag",
            "key": "coursePurchased",
            "value": true
          }
        },
        {
          "text": "You sit back, wondering if you’ve just been scammed. What do you do next?",
          "condition": {
            "kind": "flag",
            "key": "coursePurchased",
            "value": true
          }
        }
      ],
      "choices": [
        {
          "id": "4-to-11",
          "label": "Search for free resources and build your business from the ground up.",
          "target": "11",
          "condition": {
            "kind": "flag",
            "key": "coursePurchased",
            "value": false
          }
        },
        {
          "id": "4-to-12",
          "label": "Try to borrow money from friends or family to invest in the course anyway.",
          "target": "12",
          "condition": {
            "kind": "flag",
            "key": "coursePurchased",
            "value": false
          }
        },
        {
          "id": "4-to-13",
          "label": "Try to salvage something from the course and implement the advice.",
          "target": "13",
          "condition": {
            "kind": "flag",
            "key": "coursePurchased",
            "value": true
          }
        },
        {
          "id": "4-to-14",
          "label": "Cut your losses and start researching real business strategies.",
          "target": "14",
          "condition": {
            "kind": "flag",
            "key": "coursePurchased",
            "value": true
          }
        },
        {
          "id": "4-to-15",
          "label": "Double down and buy another advanced course from the same guru.",
          "target": "15",
          "condition": {
            "kind": "flag",
            "key": "coursePurchased",
            "value": true
          }
        }
      ],
      "illustration": "home",
      "sourcePages": [
        16,
        17
      ],
      "effects": [
        {
          "id": "4-course-purchased",
          "kind": "flag",
          "key": "coursePurchased",
          "value": true,
          "reason": "Course purchase eligibility before payment.",
          "when": {
            "kind": "all",
            "conditions": [
              {
                "kind": "capital",
                "operator": "gte",
                "value": 997
              },
              {
                "kind": "flag",
                "key": "coursePurchased",
                "value": false
              }
            ]
          }
        },
        {
          "id": "4-course-payment",
          "kind": "capital",
          "amount": -997,
          "category": "purchase",
          "reason": "For just $997, you could unlock the “secrets” to wealth.",
          "when": {
            "kind": "all",
            "conditions": [
              {
                "kind": "flag",
                "key": "coursePurchased",
                "value": true
              },
              {
                "kind": "flag",
                "key": "coursePaid",
                "value": false
              }
            ]
          }
        },
        {
          "id": "4-course-payment-record",
          "kind": "flag",
          "key": "coursePaid",
          "value": true,
          "reason": "Record this course purchase once for the run.",
          "when": {
            "kind": "flag",
            "key": "coursePurchased",
            "value": true
          }
        }
      ]
    },
    "5": {
      "id": "5",
      "heading": "Building Your Brand",
      "paragraphs": [
        {
          "text": "You fire up your laptop and start sketching out the look and feel of your business. A logo? Definitely. A website? Of course. A professional email address? Goodbye, Gmail, hello you@yourbrand.com."
        },
        {
          "text": "The hours fly by as you tweak colors, pick fonts, and write an “About” page that makes you sound like the next big thing. But branding alone won’t bring in customers. You need a solid plan."
        },
        {
          "text": "What’s your next step?"
        }
      ],
      "choices": [
        {
          "id": "5-to-16",
          "label": "Start posting on social media to attract attention.",
          "target": "16"
        },
        {
          "id": "5-to-17",
          "label": "Reach out to potential customers directly.",
          "target": "17"
        },
        {
          "id": "5-to-18",
          "label": "Invest in paid ads to get your brand in front of people faster.",
          "target": "18"
        }
      ],
      "illustration": "strategy",
      "sourcePages": [
        17,
        18
      ]
    },
    "6": {
      "id": "6",
      "heading": "Understanding Your Audience",
      "paragraphs": [
        {
          "text": "You lean back in your chair, realizing that before you even think about selling something, you need to understand who your customers are. It doesn’t matter if you have the best product in the world, if you don’t know who needs it, you’re just shouting into the void."
        },
        {
          "text": "You start researching. Who exactly are you serving? Are they busy professionals, fitness junkies, freelancers, or maybe small business owners? The more you define them, the clearer your path becomes. What problem are you solving? What makes your offer irresistible?"
        },
        {
          "text": "You jot down details about your ideal customer. Their pain points, desires, habits. This is your marketing avatar, your guiding light for everything you build next."
        },
        {
          "text": "What’s your next move?"
        }
      ],
      "choices": [
        {
          "id": "6-to-19",
          "label": "Conduct a survey or interview potential customers to confirm your assumptions.",
          "target": "19"
        },
        {
          "id": "6-to-20",
          "label": "Start crafting an offer based on your research.",
          "target": "20"
        },
        {
          "id": "6-to-21",
          "label": "Skip the research and just start selling.",
          "target": "21"
        }
      ],
      "illustration": "strategy",
      "sourcePages": [
        18
      ]
    },
    "7": {
      "id": "7",
      "heading": "Diving in Headfirst",
      "paragraphs": [
        {
          "text": "You decide that planning is overrated. You’re not going to waste time overanalyzing. Instead, you pick a product or service and start selling immediately."
        },
        {
          "text": "You set up a basic offer, no website, no branding, just a clear value proposition. Maybe it’s consulting, a simple digital product, or flipping items online. Whatever it is, you’re moving fast."
        }
      ],
      "choices": [],
      "illustration": "home",
      "sourcePages": [
        19
      ],
      "check": {
        "id": "section-7-check",
        "stat": "CR",
        "intro": "Now comes the first big risk. Roll 2d6 + Creativity (CR):",
        "outcomes": [
          {
            "min": 11,
            "label": "Your offer is strong, and customers start buying!",
            "target": "22",
            "rank": "success"
          },
          {
            "min": 8,
            "max": 10,
            "label": "Mixed results. Some interest, but no big wins yet.",
            "target": "23",
            "rank": "mixed"
          },
          {
            "max": 7,
            "label": "Crickets. Time for a pivot.",
            "target": "24",
            "rank": "failure"
          }
        ]
      }
    },
    "8": {
      "id": "8",
      "heading": "Strategic Learning",
      "paragraphs": [
        {
          "text": "You decide to take your time, soaking up knowledge before making any major moves. You dive into books, podcasts, and YouTube videos on entrepreneurship. Each day, you pick up something new, how to craft an irresistible offer, the psychology behind pricing, and the importance of branding. You fill notebooks with ideas, sketch out potential business models, and build confidence in your expertise."
        },
        {
          "text": "But as time passes, frustration starts creeping in. You have all this knowledge, but no action. You realize that learning is only half the battle. You need to start implementing."
        },
        {
          "text": "What do you do next?"
        }
      ],
      "choices": [
        {
          "id": "8-to-25",
          "label": "Test a small idea with minimal risk and investment.",
          "target": "25"
        },
        {
          "id": "8-to-26",
          "label": "Create a detailed business plan before making any moves.",
          "target": "26"
        },
        {
          "id": "8-to-27",
          "label": "Ask your mentor to guide you through the early stages.",
          "target": "27"
        }
      ],
      "illustration": "strategy",
      "sourcePages": [
        19,
        20
      ]
    },
    "9": {
      "id": "9",
      "heading": "Testing the Waters",
      "paragraphs": [
        {
          "text": "Instead of overthinking things, you decide to launch something small. Maybe it’s a simple freelance service, a digital product, or even flipping items for a quick profit. You throw together a quick pitch and put it out there, waiting to see if anyone bites."
        }
      ],
      "choices": [],
      "illustration": "home",
      "sourcePages": [
        20
      ],
      "check": {
        "id": "section-9-check",
        "stat": "NE",
        "intro": "Now comes the first real test of the market. Roll 2d6 + Networking (NE):",
        "outcomes": [
          {
            "min": 11,
            "label": "Success! You land a few customers and gain early traction.",
            "target": "28",
            "rank": "success"
          },
          {
            "min": 8,
            "max": 10,
            "label": "Mixed results. Some interest, but nothing sustainable yet.",
            "target": "29",
            "rank": "mixed"
          },
          {
            "max": 7,
            "label": "Crickets. Nobody seems interested. Time for a rethink.",
            "target": "30",
            "rank": "failure"
          }
        ]
      }
    },
    "10": {
      "id": "10",
      "heading": "Borrowing to Invest",
      "paragraphs": [
        {
          "text": "You decide that playing it safe isn’t going to get you anywhere fast. A little extra cash could help you launch quicker, so you explore your options. You could get a small business loan, put expenses on a credit card, or even borrow from family and friends. It feels like a gamble, but without money, growth will be slow."
        }
      ],
      "choices": [],
      "illustration": "capital",
      "sourcePages": [
        20,
        21
      ],
      "check": {
        "id": "section-10-check",
        "stat": "RE",
        "intro": "Now comes the risk. Roll 2d6 + Resilience (RE):",
        "outcomes": [
          {
            "min": 11,
            "label": "You secure the funding with favorable terms and low interest.",
            "target": "31",
            "rank": "success"
          },
          {
            "min": 8,
            "max": 10,
            "label": "You get the money, but it comes with challenges, high interest, pressure to repay fast.",
            "target": "32",
            "rank": "mixed"
          },
          {
            "max": 7,
            "label": "No one is willing to lend you money, and now you’re stuck.",
            "target": "33",
            "rank": "failure"
          }
        ]
      }
    },
    "24": {
      "id": "24",
      "heading": "The Cold, Hard Silence – Facing the Crickets",
      "paragraphs": [
        {
          "text": "You refresh your inbox. Nothing. You check your website analytics. Still nothing."
        },
        {
          "text": "Your post? Ignored. Your ad? Burned through money without a single sale."
        },
        {
          "text": "You knew starting a business wouldn’t be easy, but you didn’t expect the universe to respond with… absolute silence."
        },
        {
          "text": "For a brief moment, you wonder if you should just quit and delete everything before anyone notices. But no, you’re better than that. Time to pivot."
        },
        {
          "text": "What’s your next move?"
        },
        {
          "text": "Entrepreneurship isn’t about never failing, it’s about failing fast and adjusting before you run out of cash."
        }
      ],
      "choices": [],
      "illustration": "home",
      "sourcePages": [
        32,
        33
      ],
      "check": {
        "id": "section-24-check",
        "stat": "CR",
        "intro": "Roll 2d6 + Creativity (CR):",
        "outcomes": [
          {
            "min": 11,
            "label": "You adapt like a pro. You tweak your messaging, adjust your strategy, and find a much better angle.",
            "target": "83",
            "rank": "success"
          },
          {
            "min": 8,
            "max": 10,
            "label": "You make a few small changes. Some things improve, but it’s still slow going.",
            "target": "84",
            "rank": "mixed"
          },
          {
            "max": 7,
            "label": "Panic pivot. You throw everything at the wall, hoping something sticks… and end up wasting money.",
            "target": "85",
            "rank": "failure"
          }
        ]
      }
    },
    "27": {
      "id": "27",
      "heading": "Seeking Your Mentor’s Help – The First Real Test",
      "paragraphs": [
        {
          "text": "You decide that it’s time to stop struggling alone and actually put your mentor to use. After all, that’s what they’re here for, right?"
        },
        {
          "text": "You reach out, explain your situation, and ask for their best advice on how to move forward. But will they steer you in the right direction, or will this just be another case of “Figure it out yourself”?"
        },
        {
          "text": "If you chose The Bootstrapper:",
          "condition": {
            "kind": "mentor",
            "id": "bootstrapper"
          }
        },
        {
          "text": "\"Stop overthinking. Start doing. Right now.\"",
          "condition": {
            "kind": "mentor",
            "id": "bootstrapper"
          }
        },
        {
          "text": "If you chose The Hustler:",
          "condition": {
            "kind": "mentor",
            "id": "hustler"
          }
        },
        {
          "text": "\"You don’t need a perfect plan, you need attention. Let’s get loud.\"",
          "condition": {
            "kind": "mentor",
            "id": "hustler"
          }
        },
        {
          "text": "If you chose The Deal Maker:",
          "condition": {
            "kind": "mentor",
            "id": "deal-maker"
          }
        },
        {
          "text": "\"Your network is your shortcut. Who do you know that can help?\"",
          "condition": {
            "kind": "mentor",
            "id": "deal-maker"
          }
        },
        {
          "text": "A great mentor won’t just hand you the answers, they’ll push you to take action in ways that fit your strengths. Will you listen and execute, or hesitate and fall behind?"
        }
      ],
      "choices": [
        {
          "id": "27-to-98",
          "label": "Option 1: Launch a simple version of your offer immediately and refine it later.",
          "target": "98",
          "condition": {
            "kind": "mentor",
            "id": "bootstrapper"
          }
        },
        {
          "id": "27-to-99",
          "label": "Option 2: Hustle your way into a few quick sales through word-of-mouth marketing.",
          "target": "99",
          "condition": {
            "kind": "mentor",
            "id": "bootstrapper"
          }
        },
        {
          "id": "27-to-100",
          "label": "Option 1: Create a polarizing social media post to spark engagement and test demand.",
          "target": "100",
          "condition": {
            "kind": "mentor",
            "id": "hustler"
          }
        },
        {
          "id": "27-to-101",
          "label": "Option 2: Start direct messaging potential customers and pitching immediately.",
          "target": "101",
          "condition": {
            "kind": "mentor",
            "id": "hustler"
          }
        },
        {
          "id": "27-to-102",
          "label": "Option 1: Leverage a warm introduction to get early partnerships or deals.",
          "target": "102",
          "condition": {
            "kind": "mentor",
            "id": "deal-maker"
          }
        },
        {
          "id": "27-to-103",
          "label": "Option 2: Negotiate an exchange of services instead of spending money upfront.",
          "target": "103",
          "condition": {
            "kind": "mentor",
            "id": "deal-maker"
          }
        }
      ],
      "illustration": "mentor",
      "sourcePages": [
        35,
        36
      ]
    },
    "31": {
      "id": "31",
      "heading": "Smart Money – A Loan That Works in Your Favor",
      "paragraphs": [
        {
          "text": "You did it. You managed to secure funding on favorable terms, maybe it’s a small business loan, an investor who believes in you, or even a low-interest credit option."
        },
        {
          "text": "For once, things feel like they’re going your way. But now comes the real challenge, what do you do with the money?"
        },
        {
          "text": "Gain $2000 Capital!"
        },
        {
          "text": "What’s your next move?"
        },
        {
          "text": "A loan can be a blessing or a curse. Spend it wisely, and it fuels your success. Waste it? You’ll just be in debt with nothing to show for it."
        }
      ],
      "choices": [
        {
          "id": "31-to-116",
          "label": "Invest in marketing to get more eyes on your offer quickly.",
          "target": "116"
        },
        {
          "id": "31-to-117",
          "label": "Use the funds to improve your product/service before going all in.",
          "target": "117"
        },
        {
          "id": "31-to-118",
          "label": "Keep most of the loan as a financial cushion so you don’t run out of money too quickly.",
          "target": "118"
        }
      ],
      "illustration": "capital",
      "sourcePages": [
        39
      ],
      "effects": [
        {
          "id": "31-funding",
          "kind": "capital",
          "amount": 2000,
          "category": "gain",
          "reason": "Gain $2000 Capital!"
        }
      ]
    },
    "32": {
      "id": "32",
      "heading": "The Cost of Borrowing – Money with Strings Attached",
      "paragraphs": [
        {
          "text": "You got the money, but it wasn’t free."
        },
        {
          "text": "Maybe the interest rates are higher than expected, maybe your investor is breathing down your neck, or maybe the friend who lent you the cash keeps dropping hints about wanting their money back, soon."
        },
        {
          "text": "This funding comes with pressure, and now you need to start making money fast. Gain $1000 Capital but -1 to Tactics."
        },
        {
          "text": "What’s your next move?"
        },
        {
          "text": "Getting money is one thing, making sure it doesn’t bury you in stress is another."
        }
      ],
      "choices": [
        {
          "id": "32-to-119",
          "label": "Go aggressive, pump all the money into a big marketing push and hope for fast returns.",
          "target": "119"
        },
        {
          "id": "32-to-120",
          "label": "Play it safe, use the money in small, strategic ways to minimize risk.",
          "target": "120"
        },
        {
          "id": "32-to-204",
          "label": "Stall for time, delay repayment and hope you can earn enough before the pressure explodes",
          "target": "204"
        }
      ],
      "illustration": "capital",
      "sourcePages": [
        39,
        40
      ],
      "effects": [
        {
          "id": "32-funding",
          "kind": "capital",
          "amount": 1000,
          "category": "gain",
          "reason": "Gain $1000 Capital but -1 to Tactics."
        },
        {
          "id": "32-tactics",
          "kind": "stat",
          "stat": "TA",
          "amount": -1,
          "reason": "Gain $1000 Capital but -1 to Tactics."
        }
      ]
    },
    "33": {
      "id": "33",
      "heading": "Rejected – No One Wants to Lend You Money",
      "paragraphs": [
        {
          "text": "You tried. You pitched your idea, filled out loan applications, maybe even begged a friend or two."
        },
        {
          "text": "And yet… nothing."
        },
        {
          "text": "Banks aren’t interested. Investors don’t see the potential. Your friends? They suddenly \"don’t have the budget right now.\""
        },
        {
          "text": "Now you’re stuck with no extra funding and no choice but to figure out another way forward."
        },
        {
          "text": "What’s your next move?"
        },
        {
          "text": "No money? No problem. Plenty of businesses have started with nothing, if you’re willing to hustle."
        }
      ],
      "choices": [
        {
          "id": "33-to-122",
          "label": "Bootstrap harder, cut every unnecessary cost and grind your way forward with what you have.",
          "target": "122"
        },
        {
          "id": "33-to-123",
          "label": "Look for a business partner who can bring in capital in exchange for equity.",
          "target": "123"
        },
        {
          "id": "33-to-124",
          "label": "Try crowdfunding, launch a campaign and see if strangers believe in your idea.",
          "target": "124"
        }
      ],
      "illustration": "capital",
      "sourcePages": [
        40,
        41
      ]
    },
    "83": {
      "id": "83",
      "heading": "The Pivot Pays Off – You Find Your Groove",
      "paragraphs": [
        {
          "text": "You take a step back, analyze what went wrong, and make some smart tweaks."
        },
        {
          "text": "Maybe your messaging was off, maybe your target audience wasn’t quite right, or maybe you just needed to be a little more persistent. Whatever the case, your adjustments work."
        },
        {
          "text": "Slowly at first, but then, momentum starts to build."
        },
        {
          "text": "The inbox that was once a ghost town? Now it’s showing signs of life. Your ads? Finally converting. Your audience? Engaging."
        },
        {
          "text": "Gain $1,500 in Capital."
        },
        {
          "text": "What’s your next move?"
        },
        {
          "text": "Turns out, success isn’t about never struggling, it’s about how fast you bounce back."
        }
      ],
      "choices": [
        {
          "id": "83-to-227",
          "label": "With things picking up, you decide to push forward and scale aggressively.",
          "target": "227"
        },
        {
          "id": "83-to-228",
          "label": "Before scaling, you take a step back to ensure your business can actually handle the growth.",
          "target": "228"
        }
      ],
      "illustration": "momentum",
      "sourcePages": [
        80,
        81
      ],
      "effects": [
        {
          "id": "83-pivot-gain",
          "kind": "capital",
          "amount": 1500,
          "category": "gain",
          "reason": "Gain $1,500 in Capital."
        }
      ]
    },
    "84": {
      "id": "84",
      "heading": "Small Wins, But No Breakthroughs",
      "paragraphs": [
        {
          "text": "You make a few adjustments, tweaking your messaging, testing a new audience, maybe even trying a different marketing angle."
        },
        {
          "text": "And… it helps. A little."
        },
        {
          "text": "You’re getting some engagement, a couple of inquiries, and the occasional \"this looks interesting\" comment. But it’s not exactly the flood of customers you were hoping for."
        },
        {
          "text": "Your business is still alive, but it feels like you’re pushing a boulder uphill in slow motion."
        },
        {
          "text": "No Capital gain or loss, just a lesson in patience."
        },
        {
          "text": "What’s your next move?"
        },
        {
          "text": "Some businesses take off like rockets. Others require a bit more grinding. Which path will you take?"
        }
      ],
      "choices": [
        {
          "id": "84-to-19",
          "label": "You realize the key to getting more traction is refining your offer and making it irresistible.",
          "target": "19"
        },
        {
          "id": "84-to-17",
          "label": "You decide to focus on direct outreach to get in front of the right people faster.",
          "target": "17"
        }
      ],
      "illustration": "momentum",
      "sourcePages": [
        81,
        82
      ]
    },
    "85": {
      "id": "85",
      "heading": "The Panic Pivot – Throwing Money at the Problem",
      "paragraphs": [
        {
          "text": "The silence was too much to handle."
        },
        {
          "text": "So, in a moment of pure desperation, you tried everything."
        },
        {
          "text": "● You ran a last-minute ad campaign (with zero strategy)."
        },
        {
          "text": "● You offered a discount so big it practically screamed \"I’m desperate!\""
        },
        {
          "text": "● You rewrote your sales page five times in one night, convinced that a single word was the problem."
        },
        {
          "text": "And now? You’re down $1,000 in Capital… and not much better off than before."
        },
        {
          "text": "Panic-pivoting rarely works, but at least now you know what not to do."
        },
        {
          "text": "Lose $1,000 in Capital."
        },
        {
          "text": "What’s your next move?"
        },
        {
          "text": "Sometimes, the best way to move forward is to stop throwing spaghetti at the wall. What’s your next move?"
        }
      ],
      "choices": [
        {
          "id": "85-to-19",
          "label": "Take a step back, validate your offer properly, and make sure it actually resonates.",
          "target": "19"
        },
        {
          "id": "85-to-17",
          "label": "Realize you need to focus on sales, not random tactics, and go back to direct outreach.",
          "target": "17"
        }
      ],
      "illustration": "home",
      "sourcePages": [
        82,
        83
      ],
      "effects": [
        {
          "id": "85-panic-loss",
          "kind": "capital",
          "amount": -1000,
          "category": "setback",
          "reason": "Lose $1,000 in Capital."
        }
      ]
    },
    "280": {
      "id": "280",
      "heading": "Victory! You've Hit $10K",
      "paragraphs": [
        {
          "text": "You did it."
        },
        {
          "text": "You clawed your way through shady gurus, broken funnels, failed launches, awkward DMs, and more caffeine than any doctor would recommend…"
        },
        {
          "text": "And now? You’ve made $10,000 in Capital."
        },
        {
          "text": "You’ve gone from side-hustler with a dream to a business owner with results."
        },
        {
          "text": "Now comes the real challenge: scaling beyond $10K without losing your sanity, your audience, or your edge."
        },
        {
          "text": "→ You Win!"
        }
      ],
      "choices": [],
      "illustration": "momentum",
      "sourcePages": [
        218
      ],
      "ending": "victory"
    }
  },
  "perks": [
    {
      "id": "born-closer",
      "name": "Born Closer",
      "description": "+2 to Tactics (TA)",
      "stats": {
        "TA": 2
      },
      "capital": 0,
      "sourcePages": [
        13
      ]
    },
    {
      "id": "marketing-genius",
      "name": "Marketing Genius",
      "description": "+2 to Creativity (CR)",
      "stats": {
        "CR": 2
      },
      "capital": 0,
      "sourcePages": [
        13
      ]
    },
    {
      "id": "hustlers-work-ethic",
      "name": "Hustler’s Work Ethic",
      "description": "+1 to Resilience (RE) & +1 to Networking (NE)",
      "stats": {
        "RE": 1,
        "NE": 1
      },
      "capital": 0,
      "sourcePages": [
        13
      ]
    },
    {
      "id": "charismatic-leader",
      "name": "Charismatic Leader",
      "description": "+2 to Networking (NE)",
      "stats": {
        "NE": 2
      },
      "capital": 0,
      "sourcePages": [
        13
      ]
    },
    {
      "id": "investor-backed",
      "name": "Investor-Backed",
      "description": "Start with an extra $1000 in Capital but -2 to Resilience",
      "stats": {
        "RE": -2
      },
      "capital": 1000,
      "sourcePages": [
        13
      ]
    }
  ],
  "mentors": [
    {
      "id": "bootstrapper",
      "name": "The Bootstrapper",
      "tagline": "Master of stretching every dollar until it squeals. Systems, tools, and frugality are their creed.",
      "description": "The Bootstrapper is the gritty survivor of the business world. They don’t need investors, fancy offices, or overpriced software subscriptions. Armed with duct tape, free trials, and sheer determination, they can stretch every resource until it squeals. Their backstory is one of grinding, hustling, and building empires out of coffee-stained notebooks and second-hand laptops. They’ve been through the storms, bad launches, zero-dollar months, trolls in the inbox, and lived to tell the tale. And now, they’ll teach you how to do the same. The Bootstrapper isn’t glamorous. They’re not flashy. They’re not the one sipping cocktails in Bali while posting “#CEOlife.” They’re in the trenches, grinding out results, keeping costs low, and stacking small wins until they snowball into success. If you’re the kind of player who wants to play it smart, lean, and calculated, the Bootstrapper is your perfect first mentor.",
      "quote": "\"Why spend a dollar when you can spend a dime… or better yet, nothing at all?\"",
      "passive": {
        "name": "Frugal Mastery",
        "text": "You’ve learned how to make every dollar count. Gain +1 Resilience (RE) permanently while The Bootstrapper is your mentor. You also reduce every Capital loss by $100.",
        "stats": {
          "RE": 1
        },
        "lossReduction": 100
      },
      "power": {
        "name": "Shoestring Miracle",
        "text": "When you hit a major failure roll (6 or below) and would normally lose Capital, you may instead roll again. On the second roll, you ignore the Capital loss, even if you still fail. The Bootstrapper knows how to patch the holes and keep you alive another day.",
        "kind": "reroll-loss"
      },
      "sourcePages": [
        227,
        228,
        229
      ]
    },
    {
      "id": "hustler",
      "name": "The Hustler",
      "tagline": "Relentless, fast-talking, always chasing the next sale. Deals and pressure are where they thrive.",
      "description": "The Hustler is pure energy bottled up in human form. They’re the entrepreneur who will cold DM 200 strangers before breakfast, pitch three new offers by lunch, and still be scheming at 2 AM. Subtlety? Never heard of it. Perfection? That’s procrastination in disguise. Their backstory is one of clawing their way up from nothing with nothing but relentless drive. They’ve been ghosted, rejected, laughed at, and told to “get a real job” more times than they can count. But every ‘no’ was just fuel. Every slammed door made them knock harder on the next one. And eventually, all that grinding turned into wins. The Hustler isn’t polished. They’re not the type who waits for perfect branding or a shiny funnel. They thrive in chaos, live off momentum, and believe that volume beats precision every single time. If you want to learn how to sell, survive, and thrive with sheer force of will, the Hustler is your mentor.",
      "quote": "“Sleep is for the weak. Coffee is for the hustlers.”",
      "passive": {
        "name": "Relentless Drive",
        "text": "You refuse to quit. Gain +2 Resilience (RE) permanently while The Hustler is your mentor.",
        "stats": {
          "RE": 2
        }
      },
      "power": {
        "name": "Grind It Out",
        "text": "When you fail a roll that would cost you Capital, you may choose to “grind it out.” Reduce the loss by half, rounding the amount you still lose up to the nearest $100. You don’t lose, you just work harder.",
        "kind": "halve-loss"
      },
      "sourcePages": [
        229,
        230
      ]
    },
    {
      "id": "deal-maker",
      "name": "The Deal Maker",
      "tagline": "A charmer, a networker, a master of alliances. Where others see obstacles, they see partnerships.",
      "description": "The Deal Maker is the smooth-talking operator of the business world. They know the right people, say the right words, and always seem to land in the right room at the right time. If there’s a back door to success, they’ve already found it, and probably charged someone else admission. Their backstory is one of endless handshakes, coffee meetings, and strategic introductions. They’re the person who can turn a chance encounter on a plane into a six-figure deal, or who somehow convinces a vendor to throw in 90 extra days of credit “just because.” Where others see obstacles, the Deal Maker sees leverage. The Deal Maker isn’t the one burning midnight oil or scrimping pennies. They’re playing the high-level game, cutting deals, trading favors, and building partnerships that change the trajectory of a business overnight. If you want to learn how to scale faster through connections, negotiations, and opportunities, the Deal Maker is your mentor.",
      "quote": "“Why work harder when you can work smarter, and let someone else foot the bill?”",
      "passive": {
        "name": "Silver Tongue",
        "text": "Your words carry weight. Gain +2 Networking (NE) permanently while The Deal Maker is your mentor.",
        "stats": {
          "NE": 2
        }
      },
      "power": {
        "name": "The Big Play",
        "text": "Once per act, when you’re facing a major failure or setback, you can “call in a favor.” Instead of taking the loss, treat the event as a neutral outcome, no gain, no loss. The Deal Maker knows how to smooth things over and keep the game moving.",
        "kind": "neutral-result"
      },
      "sourcePages": [
        230,
        231
      ]
    }
  ]
};

export const INTRO_PARAGRAPHS: string[] = [
  "You stare at the blinking cursor on your laptop screen, hands hovering over the keyboard. This is it, the moment where you take the leap from dreaming about being your own boss to actually making it happen. No more excuses. No more “I’ll start tomorrow.” Today is the day you begin building your empire.",
  "But let’s be honest: You have no idea what you’re doing.",
  "You’ve read the success stories, seen the flashy Instagram posts of entrepreneurs sipping lattes in Bali, and binged enough motivational videos to fill a TED Talk marathon. But deep down, you’re still wondering, how do people actually make money online?",
  "The good news? That’s exactly what you’re about to figure out.",
  "The bad news? It won’t be easy.",
  "Starting a business is like stepping onto a roller coaster that you built yourself while blindfolded. There will be highs, there will be lows, and at times, you’ll feel like the whole thing is about to come crashing down. But that’s what makes it exciting, right?",
  "You imagine the possibilities, working from anywhere, making money doing something you love, proving all the doubters wrong.",
  "But then reality hits: How do you even start?",
  "Do you register an LLC? Build a website? Buy a course from a guy who promises you’ll be making six figures in a month if you just ‘DM 100 people a day’?",
  "You grab your notebook and scribble down some ideas.",
  "Maybe you’ll sell a product, offer a service, start a YouTube channel, or create an app. The options are endless, but one thing is clear, you have to pick a path and take action.",
  "As you take a deep breath, the excitement starts to outweigh the fear.",
  "You’re not just playing a game, you’re learning real business skills that could change your life.",
  "And the best part?",
  "You’re in control of your own story!",
  "Your adventure begins now and it's time to take the first step…"
];

export const INTRO_SOURCE_PAGES = [10, 11] as const;

export const HOW_TO_PLAY_PARAGRAPHS: string[] = [
  "Game Rules & Mechanics",
  "Every quest needs rules. Without them, there is only chaos, confusion… and entrepreneurs crying into their social feeds. So before you embark on your journey, let us set the stage for how this game is played, how fortune is measured, and how the wise choose allies to guide them.",
  "How to Play the Game",
  "You are about to step into the shoes of a would-be business hero. Unlike other adventures where you slay dragons or hunt treasure, your weapons here are marketing campaigns, bold pitches, and dice rolls.",
  "You begin at Section 1, with nothing more than a dream, a notebook, and $1,000 Capital, your lifeblood, your health bar, your measure of power in the marketplace. Lose it all and your empire crumbles to dust. Grow it to $10,000 and you’ll ascend to the next chapter of your legend. If you have reached at least $10,000 Capital, immediately turn to Section 280 unless the current section specifically tells you otherwise.",
  "At the end of most sections, you’ll be offered choices. These choices shape your fate:",
  "● You might press forward boldly, risking much in search of riches.",
  "● You might take a cautious route, eking out survival until fortune smiles again.",
  "● Or fate might demand you test your luck with the dice, where chance decides whether your idea soars or belly-flops into the abyss.",
  "When you are told to roll, cast two six-sided dice (2d6) and add the stat listed, Creativity, Tactics, Resilience, Networking, or Tech Savviness.",
  "● 11+ means triumph: your gambit works.",
  "● 8-10 is mixed: success tinged with cost or compromise.",
  "● 7 or less is failure: Capital vanishes, momentum shatters, and you must pick yourself back up.",
  "The game is simple to follow, yet its outcomes mirror the real world of business. Bold gambles may pay off, or ruin you. Careful choices may keep you safe, but rarely lead to glory.",
  "Spending & Managing Capital",
  "Capital is the beating heart of your journey. Think of it as both your treasure chest and your life bar. Each coin you earn or lose represents the tide of your business fortunes.",
  "● You begin with $1,000 Capital.",
  "● Sections may grant you Capital (sales, victories, investments) or take it away (bad hires, wasted ad spend, trolls).",
  "● If your Capital ever falls to zero, your business collapses, your story ends, and you must return to the beginning to try again.",
  "● If you reach $10,000, you have proven yourself worthy and move to section 280.",
  "Remember: money here is not a score. It is blood in the veins. Treat it recklessly, and you may bleed out. Guard it wisely, and it may grow into the fortune you seek.",
  "The Mentor System",
  "Even the boldest founder knows this: no one conquers the market alone. Along the way, you will swear allegiance to a Mentor, a guide who grants you wisdom, special abilities, and an edge against the cruel odds of business life.",
  "In Act 1, you may choose between:",
  "● The Bootstrapper – Master of stretching every dollar until it squeals. Systems, tools, and frugality are their creed.",
  "● The Hustler – Relentless, fast-talking, always chasing the next sale. Deals and pressure are where they thrive.",
  "● The Deal Maker – A charmer, a networker, a master of alliances. Where others see obstacles, they see partnerships.",
  "Each Mentor grants you two gifts:",
  "1. A passive ability, a constant bonus in their area of mastery (systems, selling, or networking).",
  "2. A once-per-Act power, a trump card you can play when the dice, or fate, deal you a cruel hand.",
  "You will choose your first Mentor before you begin in the following pages. Later, when Acts shift and your business grows, you may cast off one guide for another, or remain loyal to the same voice through thick and thin. The choice is yours.",
  "The Shape of the Journey",
  "You will begin as a small dreamer with little more than an idea. You will roll dice, make choices, win or lose Capital, and, if fortune and wit allow, climb to the coveted $10,000 threshold that marks your true beginning.",
  "But beware: fate is fickle, and the path is fraught with setbacks. You may go bankrupt. You may fall victim to bad luck. You may face trolls, critics, or your own poor decisions.",
  "Yet remember: this book is a game, and games are meant to be played again and again. Each failure teaches you something. Each new run offers another path, another mentor, another destiny.",
  "So sharpen your pencil, ready your dice, and steady your heart. The rules are set, the stage is prepared, and the marketplace awaits!"
];

export const HOW_TO_PLAY_SOURCE_PAGES = [222, 223, 224, 225, 226] as const;

export const MENTOR_PROFILES = {
  "bootstrapper": {
    "name": "The Bootstrapper",
    "paragraphs": [
      "\"Why spend a dollar when you can spend a dime… or better yet, nothing at all?\"",
      "The Bootstrapper is the gritty survivor of the business world. They don’t need investors, fancy offices, or overpriced software subscriptions. Armed with duct tape, free trials, and sheer determination, they can stretch every resource until it squeals.",
      "Their backstory is one of grinding, hustling, and building empires out of coffee-stained notebooks and second-hand laptops. They’ve been through the storms, bad launches, zero-dollar months, trolls in the inbox, and lived to tell the tale. And now, they’ll teach you how to do the same.",
      "The Bootstrapper isn’t glamorous. They’re not flashy. They’re not the one sipping cocktails in Bali while posting “#CEOlife.” They’re in the trenches, grinding out results, keeping costs low, and stacking small wins until they snowball into success.",
      "If you’re the kind of player who wants to play it smart, lean, and calculated, the Bootstrapper is your perfect first mentor.",
      "What They Offer",
      "Passive Ability: Frugal Mastery",
      "● You’ve learned how to make every dollar count. Gain +1",
      "Resilience (RE) permanently while The Bootstrapper is your mentor. You also reduce every Capital loss by $100.",
      "Once-Per-Act Power: Shoestring Miracle",
      "● When you hit a major failure roll (6 or below) and would",
      "normally lose Capital, you may instead roll again. On the second roll, you ignore the Capital loss, even if you still fail. The Bootstrapper knows how to patch the holes and keep you alive another day.",
      "The Bootstrapper’s Wisdom",
      "● “Your first office? It’s your bedroom. Deal with it.”",
      "● “If you can’t sell it with duct tape, Canva, and a free trial, it",
      "probably wasn’t worth selling.” ● “Remember: Amazon started in a garage. Your business",
      "doesn’t need to look perfect. It just needs to survive.”"
    ],
    "text": "The Bootstrapper \"Why spend a dollar when you can spend a dime… or better yet, nothing at all?\" The Bootstrapper is the gritty survivor of the business world. They don’t need investors, fancy offices, or overpriced software subscriptions. Armed with duct tape, free trials, and sheer determination, they can stretch every resource until it squeals. Their backstory is one of grinding, hustling, and building empires out of coffee-stained notebooks and second-hand laptops. They’ve been through the storms, bad launches, zero-dollar months, trolls in the inbox, and lived to tell the tale. And now, they’ll teach you how to do the same. The Bootstrapper isn’t glamorous. They’re not flashy. They’re not the one sipping cocktails in Bali while posting “#CEOlife.” They’re in the trenches, grinding out results, keeping costs low, and stacking small wins until they snowball into success. If you’re the kind of player who wants to play it smart, lean, and calculated, the Bootstrapper is your perfect first mentor. What They Offer Passive Ability: Frugal Mastery ● You’ve learned how to make every dollar count. Gain +1 Resilience (RE) permanently while The Bootstrapper is your mentor. You also reduce every Capital loss by $100. Once-Per-Act Power: Shoestring Miracle ● When you hit a major failure roll (6 or below) and would normally lose Capital, you may instead roll again. On the second roll, you ignore the Capital loss, even if you still fail. The Bootstrapper knows how to patch the holes and keep you alive another day. The Bootstrapper’s Wisdom ● “Your first office? It’s your bedroom. Deal with it.” ● “If you can’t sell it with duct tape, Canva, and a free trial, it probably wasn’t worth selling.” ● “Remember: Amazon started in a garage. Your business doesn’t need to look perfect. It just needs to survive.”",
    "sourcePages": [
      227,
      228,
      229
    ]
  },
  "hustler": {
    "name": "The Hustler",
    "paragraphs": [
      "“Sleep is for the weak. Coffee is for the hustlers.”",
      "The Hustler is pure energy bottled up in human form. They’re the entrepreneur who will cold DM 200 strangers before breakfast, pitch three new offers by lunch, and still be scheming at 2 AM. Subtlety? Never heard of it. Perfection? That’s procrastination in disguise.",
      "Their backstory is one of clawing their way up from nothing with nothing but relentless drive. They’ve been ghosted, rejected, laughed at, and told to “get a real job” more times than they can count. But every ‘no’ was just fuel. Every slammed door made them knock harder on the next one. And eventually, all that grinding turned into wins.",
      "The Hustler isn’t polished. They’re not the type who waits for perfect branding or a shiny funnel. They thrive in chaos, live off momentum, and believe that volume beats precision every single time. If you want to learn how to sell, survive, and thrive with sheer force of will, the Hustler is your mentor.",
      "What They Offer",
      "Passive Ability: Relentless Drive You refuse to quit. Gain +2 Resilience (RE) permanently while The Hustler is your mentor.",
      "Once-Per-Act Power: Grind It Out When you fail a roll that would cost you Capital, you may choose to “grind it out.” Reduce the loss by half, rounding the amount you still lose up to the nearest $100. You don’t lose, you just work harder.",
      "The Hustler’s Wisdom",
      "● “Perfection kills dreams. Action makes money.”",
      "● “Every ‘no’ is just a ‘not yet’ waiting to happen.”",
      "● “You don’t need talent, you need stamina. Outwork",
      "everyone, and eventually, you’ll win.”"
    ],
    "text": "The Hustler “Sleep is for the weak. Coffee is for the hustlers.” The Hustler is pure energy bottled up in human form. They’re the entrepreneur who will cold DM 200 strangers before breakfast, pitch three new offers by lunch, and still be scheming at 2 AM. Subtlety? Never heard of it. Perfection? That’s procrastination in disguise. Their backstory is one of clawing their way up from nothing with nothing but relentless drive. They’ve been ghosted, rejected, laughed at, and told to “get a real job” more times than they can count. But every ‘no’ was just fuel. Every slammed door made them knock harder on the next one. And eventually, all that grinding turned into wins. The Hustler isn’t polished. They’re not the type who waits for perfect branding or a shiny funnel. They thrive in chaos, live off momentum, and believe that volume beats precision every single time. If you want to learn how to sell, survive, and thrive with sheer force of will, the Hustler is your mentor. What They Offer Passive Ability: Relentless Drive You refuse to quit. Gain +2 Resilience (RE) permanently while The Hustler is your mentor. Once-Per-Act Power: Grind It Out When you fail a roll that would cost you Capital, you may choose to “grind it out.” Reduce the loss by half, rounding the amount you still lose up to the nearest $100. You don’t lose, you just work harder. The Hustler’s Wisdom ● “Perfection kills dreams. Action makes money.” ● “Every ‘no’ is just a ‘not yet’ waiting to happen.” ● “You don’t need talent, you need stamina. Outwork everyone, and eventually, you’ll win.”",
    "sourcePages": [
      229,
      230
    ]
  },
  "deal-maker": {
    "name": "The Deal Maker",
    "paragraphs": [
      "“Why work harder when you can work smarter, and let someone else foot the bill?”",
      "The Deal Maker is the smooth-talking operator of the business world. They know the right people, say the right words, and always seem to land in the right room at the right time. If there’s a back door to success, they’ve already found it, and probably charged someone else admission.",
      "Their backstory is one of endless handshakes, coffee meetings, and strategic introductions. They’re the person who can turn a chance encounter on a plane into a six-figure deal, or who somehow convinces a vendor to throw in 90 extra days of credit “just because.” Where others see obstacles, the Deal Maker sees leverage.",
      "The Deal Maker isn’t the one burning midnight oil or scrimping pennies. They’re playing the high-level game, cutting deals, trading favors, and building partnerships that change the trajectory of a business overnight. If you want to learn how to scale faster through connections, negotiations, and opportunities, the Deal Maker is your mentor.",
      "What They Offer",
      "Passive Ability: Silver Tongue Your words carry weight. Gain +2 Networking (NE) permanently while The Deal Maker is your mentor.",
      "Once-Per-Act Power: The Big Play Once per act, when you’re facing a major failure or setback, you can “call in a favor.” Instead of taking the loss, treat the event as a neutral outcome, no gain, no loss. The Deal Maker knows how to smooth things over and keep the game moving.",
      "The Deal Maker’s Wisdom",
      "● “Every ‘no’ just means you’re talking to the wrong person.”",
      "● “Money is good. Relationships are better.”",
      "● “Deals don’t just happen, they’re made.”"
    ],
    "text": "The Deal Maker “Why work harder when you can work smarter, and let someone else foot the bill?” The Deal Maker is the smooth-talking operator of the business world. They know the right people, say the right words, and always seem to land in the right room at the right time. If there’s a back door to success, they’ve already found it, and probably charged someone else admission. Their backstory is one of endless handshakes, coffee meetings, and strategic introductions. They’re the person who can turn a chance encounter on a plane into a six-figure deal, or who somehow convinces a vendor to throw in 90 extra days of credit “just because.” Where others see obstacles, the Deal Maker sees leverage. The Deal Maker isn’t the one burning midnight oil or scrimping pennies. They’re playing the high-level game, cutting deals, trading favors, and building partnerships that change the trajectory of a business overnight. If you want to learn how to scale faster through connections, negotiations, and opportunities, the Deal Maker is your mentor. What They Offer Passive Ability: Silver Tongue Your words carry weight. Gain +2 Networking (NE) permanently while The Deal Maker is your mentor. Once-Per-Act Power: The Big Play Once per act, when you’re facing a major failure or setback, you can “call in a favor.” Instead of taking the loss, treat the event as a neutral outcome, no gain, no loss. The Deal Maker knows how to smooth things over and keep the game moving. The Deal Maker’s Wisdom ● “Every ‘no’ just means you’re talking to the wrong person.” ● “Money is good. Relationships are better.” ● “Deals don’t just happen, they’re made.”",
    "sourcePages": [
      230,
      231
    ]
  }
} as const;

export const ATTRIBUTES = GAME.attributes;
export const PERKS = GAME.perks;
export const MENTORS = GAME.mentors;
export const SCENES = GAME.scenes;
