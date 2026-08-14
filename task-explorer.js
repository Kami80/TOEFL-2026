(function () {
  'use strict';

  const ETS_PRACTICE = 'https://www.ets.org/content/dam/ets-org/pdfs/toefl/toefl-ibt-full-length-practice-test-1.pdf';
  const ETS_TEACHER_2 = 'https://www.ets.org/content/dam/ets-org/pdfs/toefl/toefl-ibt-teachers-resources-practice-test-2.pdf';
  const ETS_WRITING = 'https://www.ets.org/content/dam/ets-org/pdfs/toefl/toefl-ibt-lesson-plan-writing.pdf';
  const ETS_SPEAKING = 'https://www.ets.org/content/dam/ets-org/pdfs/toefl/toefl-ibt-lesson-plan-speaking.pdf';

  const sectionMeta = {
    reading: { letter: 'R', label: 'Reading', color: 'violet' },
    listening: { letter: 'L', label: 'Listening', color: 'cyan' },
    writing: { letter: 'W', label: 'Writing', color: 'amber' },
    speaking: { letter: 'S', label: 'Speaking', color: 'rose' }
  };

  const tasks = [
    {
      id: 'complete-words', section: 'reading', number: '01', title: 'Complete the Words', tag: 'FOUNDATIONAL · 30 ITEMS ACROSS THE SECTION',
      summary: 'Reconstruct partially missing words inside a connected paragraph.',
      description: 'A short paragraph stays visible while selected words lose their final letters. The task combines spelling, morphology, syntax, and whole-passage meaning; a plausible-looking word still fails if its form does not fit the sentence.',
      facts: ['Short connected text', '10 incomplete words per set', 'Type only the missing letters'],
      measures: ['Vocabulary and word form in context', 'Spelling and morphological control', 'Local syntax plus passage coherence'],
      workflow: ['Skim the complete paragraph for topic and tense.', 'Predict each gap’s part of speech before spelling it.', 'Use the visible beginning plus grammar to rebuild the word.', 'Reread the full sentence, then the paragraph.'],
      traps: ['Completing from first letters alone', 'Ignoring plural, tense, or suffix clues'],
      example: {
        label: 'OFFICIAL ETS EXCERPT', source: 'Practice Test 1 · brain paragraph', url: ETS_PRACTICE + '#page=4',
        prompt: '“It i- divided in-- several reg----, each wi-- specific ro---.”',
        answer: '<b>is · into · regions · with · roles</b>',
        note: 'Notice how grammar resolves every gap: passive “is divided,” preposition “into,” plural count nouns, and the preposition “with.”'
      }
    },
    {
      id: 'daily-life', section: 'reading', number: '02', title: 'Read in Daily Life', tag: 'EVERYDAY + CAMPUS TEXTS',
      summary: 'Interpret notices, emails, posts, schedules, and other practical formats.',
      description: 'Texts may be linear or visually structured. Questions target purpose, details, referents, implied meaning, and likely action. Layout is evidence: sender lines, dates, headings, prices, and restrictions can carry the answer.',
      facts: ['About 15–150 words', '2- or 3-question sets', 'Text remains visible'],
      measures: ['Main purpose and practical outcome', 'Specific details and referents', 'Constrained inference'],
      workflow: ['Identify source, audience, and purpose.', 'Scan names, dates, conditions, and action verbs.', 'Match each option to an exact text detail.', 'For inference, choose the smallest safe conclusion.'],
      traps: ['Answering from life experience instead of the text', 'Missing “except,” “unless,” or a changed date'],
      example: {
        label: 'OFFICIAL ETS EXCERPT', source: 'Practice Test 1 · art workshop email', url: ETS_PRACTICE + '#page=9',
        prompt: '“All necessary art supplies will be provided, but please bring your own apron or smock.” What must the attendee bring?',
        answer: '<b>A protective garment.</b>',
        note: 'The correct option paraphrases “apron or smock”; it does not need to repeat the same words.'
      }
    },
    {
      id: 'academic-passage', section: 'reading', number: '03', title: 'Read an Academic Passage', tag: 'ACADEMIC · UP TO 5 QUESTIONS',
      summary: 'Analyze a focused expository passage similar to university reading.',
      description: 'A compact academic passage provides all required background. Questions can test main idea, detail, vocabulary, inference, idea relationships, and rhetorical purpose.',
      facts: ['Up to about 200 words', 'Up to 5 questions', 'No specialist knowledge required'],
      measures: ['Main and supporting ideas', 'Inference and vocabulary in context', 'Rhetorical structure and relationships'],
      workflow: ['Map topic, claim, and paragraph functions.', 'Mark contrast, cause, examples, and conclusions.', 'Target the supporting line, then widen to context.', 'Reject options that exaggerate a cautious claim.'],
      traps: ['Memorizing before reading the questions', 'Choosing a true statement that is not the author’s point'],
      example: {
        label: 'OFFICIAL ETS TOPIC', source: 'Practice Test 1 · The Paradox of Choice', url: ETS_PRACTICE + '#page=11',
        prompt: 'The passage argues that fewer options can sometimes increase satisfaction. Which main idea fits best?',
        answer: '<b>Limiting consumer choices can lead to higher satisfaction.</b>',
        note: 'A main idea must cover the mechanism and outcome, not merely label the topic “consumer choice.”'
      }
    },
    {
      id: 'choose-response', section: 'listening', number: '04', title: 'Listen and Choose a Response', tag: 'AUDIO-ONLY PROMPT',
      summary: 'Hear one question or statement and select the socially appropriate reply.',
      description: 'The prompt is not printed and plays once. Strong performance depends on recognizing the speech act—request, offer, complaint, suggestion, or information question—before comparing the choices.',
      facts: ['15–19 items in the blueprint', 'Single exchange', 'Prompt plays once'],
      measures: ['Literal meaning', 'Speaker intent', 'Pragmatically natural response'],
      workflow: ['Name the speech act immediately.', 'Hold the key content and intended function.', 'Predict the type of response needed.', 'Choose the option that advances the exchange.'],
      traps: ['Selecting repeated vocabulary with the wrong function', 'Missing indirect requests or polite offers'],
      example: {
        label: 'OFFICIAL ETS ITEM', source: 'Practice Test 1 · Listening Module 2', url: ETS_PRACTICE + '#page=22',
        prompt: 'Speaker: “Would you like a copy of my notes?”',
        answer: '<b>“That would be great.”</b>',
        note: 'The question is an offer. The best reply accepts it naturally rather than discussing the location or topic of the notes.'
      }
    },
    {
      id: 'conversation', section: 'listening', number: '05', title: 'Listen to a Conversation', tag: '2 SPEAKERS · 2 QUESTIONS',
      summary: 'Follow a short exchange about everyday or campus life.',
      description: 'A conversation normally moves through a problem, options, and a decision. Questions test purpose, details, implied meaning, speaker intent, or the most likely next action.',
      facts: ['2 speakers', '2 questions per conversation', 'Audio plays once'],
      measures: ['Main problem and purpose', 'Key details and decision', 'Intent, implication, and next step'],
      workflow: ['Note who, where, and why the exchange starts.', 'Track problem → options → decision.', 'Write anchors rather than a transcript.', 'Use tone and final turns to resolve implication.'],
      traps: ['Treating the first suggestion as the final choice', 'Writing so much that the outcome is missed'],
      example: {
        label: 'OFFICIAL ETS SCENARIO', source: 'Practice Test 1 · device conversation', url: ETS_PRACTICE + '#page=23',
        prompt: 'A student is deciding between a smartphone and a tablet. Why is the smartphone suggested?',
        answer: '<b>It is portable and easier to use on the go.</b>',
        note: 'The answer comes from the woman’s reason, not from the man’s later preference for a larger screen.'
      }
    },
    {
      id: 'announcement', section: 'listening', number: '06', title: 'Listen to an Announcement', tag: 'CAMPUS LOGISTICS',
      summary: 'Extract purpose, changed details, and required action from a short message.',
      description: 'Announcements are consequence-driven. Listen for what changed, when it applies, who is affected, and what the audience should do next.',
      facts: ['Short monologue', 'Campus or classroom context', 'Logistics + purpose'],
      measures: ['Speaker purpose', 'Dates, conditions, and corrections', 'Likely listener action'],
      workflow: ['Capture the headline change.', 'Use a who / what / when / where / action grid.', 'Mark any contrast that replaces old information.', 'Separate required action from optional detail.'],
      traps: ['Recording names but missing the instruction', 'Confusing an old schedule with its correction'],
      example: {
        label: 'OFFICIAL ETS SCENARIO', source: 'Practice Test 1 · student lounge closure', url: ETS_PRACTICE + '#page=23',
        prompt: 'The lounge closes from 1–3 p.m. for a pipe repair. What should students do?',
        answer: '<b>Use alternate spaces such as the library or campus café.</b>',
        note: 'Purpose and action are different notes: “temporary closure” is the purpose; “use another space” is the action.'
      }
    },
    {
      id: 'academic-talk', section: 'listening', number: '07', title: 'Listen to an Academic Talk', tag: 'ACADEMIC MONOLOGUE · 4 QUESTIONS',
      summary: 'Follow a compact lecture or expert explanation after one listen.',
      description: 'The talk typically develops a concept with examples, comparisons, causes, or consequences. Notes should expose that hierarchy rather than preserve every sentence.',
      facts: ['About 100–250 words', '4 questions per talk', 'No prior subject knowledge needed'],
      measures: ['Main and supporting ideas', 'Organization and example function', 'Inference and vocabulary in context'],
      workflow: ['Write the topic and main claim at the top.', 'Indent examples under the idea they support.', 'Mark cause, contrast, sequence, and conclusion.', 'Summarize the talk in one sentence before question one.'],
      traps: ['Promoting one example into the main idea', 'Collecting facts with no relationships'],
      example: {
        label: 'OFFICIAL ETS TOPIC', source: 'Practice Test 1 · ecological footprint', url: ETS_PRACTICE + '#page=24',
        prompt: 'The professor defines ecological footprint, compares lifestyles, and gives ways to reduce it. What is the main topic?',
        answer: '<b>A measure of environmental impact.</b>',
        note: 'The examples of countries and local food support the definition; neither example is broad enough to be the main topic.'
      }
    },
    {
      id: 'build-sentence', section: 'writing', number: '08', title: 'Build a Sentence', tag: '10 ITEMS · EXACT ORDER',
      summary: 'Arrange supplied words or phrases into a grammatical sentence or question.',
      description: 'Context establishes meaning and sentence type. You then move chunks into exact order. The set can test direct questions, embedded questions, clauses, modifiers, negation, and complements.',
      facts: ['10 machine-scored items', 'Move words or phrases', '1 raw point each'],
      measures: ['Word order and clause structure', 'Grammar across sentence types', 'Meaning appropriate to context'],
      workflow: ['Decide statement, direct question, or embedded question.', 'Build the subject + finite verb spine.', 'Attach clauses and modifiers to their heads.', 'Read the complete sentence internally.'],
      traps: ['Using inversion inside an embedded question', 'Leaving modifiers far from what they describe'],
      example: {
        label: 'OFFICIAL ETS ITEM', source: 'Practice Test 1 · Writing', url: ETS_PRACTICE + '#page=28',
        prompt: 'Context: “I heard Anna got a promotion.” Chunks: do / you / know / if / she will be / moving to / a different department',
        answer: '<b>Do you know if she will be moving to a different department?</b>',
        note: 'The outer direct question uses inversion (“Do you know”), but the embedded clause keeps statement order (“she will be”).'
      }
    },
    {
      id: 'write-email', section: 'writing', number: '09', title: 'Write an Email', tag: '1 RESPONSE · 7 MINUTES',
      summary: 'Write for a concrete academic or social purpose and a specified reader.',
      description: 'A short scenario and two or three action bullets define the response. The rating rewards effective elaboration, language range, and appropriate social conventions such as tone, politeness, organization, and request wording.',
      facts: ['7 minutes total', 'Word count; no spell-check', '0–5 task score'],
      measures: ['Completion and elaboration', 'Register, politeness, and organization', 'Grammar and precise vocabulary'],
      workflow: ['Label audience, purpose, and every action bullet.', 'State context and purpose immediately.', 'Give each action one useful detail.', 'Close appropriately; proofread for missing words.'],
      traps: ['Missing one requested action', 'Using professor-level formality with a friend—or the reverse'],
      example: {
        label: 'OFFICIAL ETS PROMPT SHAPE', source: 'Practice Test 1 · poetry submission', url: ETS_PRACTICE + '#page=30',
        prompt: 'Email a magazine editor: praise the magazine, explain a submission-form problem, and ask whether two poems arrived.',
        answer: '<b>Best structure:</b> greeting → specific praise → exact technical problem → confirmation request → polite close.',
        note: 'Open the highlighted Writing Studio below for three complete, color-coded email models.'
      }
    },
    {
      id: 'academic-discussion', section: 'writing', number: '10', title: 'Write for an Academic Discussion', tag: '1 RESPONSE · 10 MINUTES',
      summary: 'Add a supported, original contribution to a professor-led online discussion.',
      description: 'The professor asks a question and two students post views. Your response should answer, support, and contribute—not merely summarize. ETS states that an effective response contains at least 100 words.',
      facts: ['10 minutes', 'Effective response: at least 100 words', '0–5 task score'],
      measures: ['Relevant, well-elaborated ideas', 'A real contribution to the thread', 'Varied grammar and precise vocabulary'],
      workflow: ['Map the professor and both student positions.', 'State your answer and main reason immediately.', 'Develop one explanation or concrete example.', 'Connect to a student, add a new angle, and proofread.'],
      traps: ['Only repeating the student posts', 'Packing in several undeveloped reasons'],
      example: {
        label: 'OFFICIAL ETS PROMPT', source: 'Practice Test 1 · volunteerism discussion', url: ETS_PRACTICE + '#page=31',
        prompt: '“Should high school students be required to do volunteer work?”',
        answer: '<b>High-value move:</b> acknowledge the time-pressure concern, then propose flexible service options that preserve access and civic learning.',
        note: 'This both responds to another student and contributes a workable condition of your own.'
      }
    },
    {
      id: 'listen-repeat', section: 'speaking', number: '11', title: 'Listen and Repeat', tag: '7 ITEMS · NO PREP',
      summary: 'Repeat seven increasingly complex sentences accurately and intelligibly.',
      description: 'Each sentence plays once inside a shared academic-navigation scenario. The highest rubric band requires an exact, fully intelligible repetition; meaning groups make longer sentences easier to retain.',
      facts: ['7 sentences', 'One listen per sentence', 'Maximum 5 points each'],
      measures: ['Content accuracy and order', 'Intelligibility', 'Rhythm and fluent completion'],
      workflow: ['Hear the sentence as meaning groups.', 'Hold stressed content words and grammar links.', 'Start promptly and preserve original order.', 'If one word is lost, finish instead of freezing.'],
      traps: ['Paraphrasing instead of repeating', 'Restarting repeatedly to repair one word'],
      example: {
        label: 'OFFICIAL ETS SENTENCE', source: 'Practice Test 1 · zoo scenario', url: ETS_PRACTICE + '#page=34',
        prompt: '“Bears, wolves, and large cats are to the right.”',
        answer: '<b>Chunk:</b> Bears, wolves, and large cats / are / to the right.',
        note: 'The chunk map protects the three-item subject, linking verb, and location phrase without changing any content.'
      }
    },
    {
      id: 'take-interview', section: 'speaking', number: '12', title: 'Take an Interview', tag: '4 QUESTIONS · NO PREP',
      summary: 'Respond spontaneously to a prerecorded interviewer in one connected scenario.',
      description: 'Questions elicit familiar description, experience, preference, explanation, prediction, or opinion. A strong response answers fully, stays on topic, develops an idea, maintains a conversational pace, and remains easy to understand.',
      facts: ['4 related questions', 'Prerecorded interviewer', 'Maximum 5 points each'],
      measures: ['Relevance and elaboration', 'Conversational delivery and intelligibility', 'Grammar and vocabulary range'],
      workflow: ['Answer the exact question in sentence one.', 'Explain one reason or mechanism.', 'Add a concrete example, contrast, or result.', 'Finish the idea before the clock ends.'],
      traps: ['A memorized introduction that delays the answer', 'Listing reasons without developing any'],
      example: {
        label: 'OFFICIAL ETS QUESTION', source: 'Practice Test 1 · urban life interview', url: ETS_PRACTICE + '#page=35',
        prompt: '“Do you currently live in a big city, a small town, or a village?”',
        answer: '<b>Direct start:</b> “I currently live in a medium-sized city, and the part I value most is having services within a short walk.”',
        note: 'The first sentence answers and opens a line of development. See four highlighted response engines below.'
      }
    }
  ];

  const writingTemplates = {
    'email-problem': {
      kind: 'email', eyebrow: 'FORMAL EMAIL · PROBLEM + REQUEST', title: 'Report → impact → specific action',
      source: 'User-supplied landlord example', sourceUrl: 'writing-practice.html', wordCount: 142,
      prompt: 'You moved into a new apartment. Describe maintenance problems, explain how they affect daily life, and request prompt repairs.',
      skeleton: [
        ['greeting', 'Dear [title + name],'], ['purpose', 'I hope you are doing well. I’m writing to [purpose].'],
        ['detail', 'Recently, [problem 1 + observable detail].'], ['impact', 'This [specific consequence]. In addition, [problem 2 + consequence].'],
        ['request', 'Would it be possible to [specific action + useful availability]?'], ['close', 'Thank you for [time/help]. Sincerely, [name]']
      ],
      response: [
        ['greeting', 'Dear Mr. Hill,'],
        ['purpose', 'I hope you are doing well. I’m writing to report two maintenance issues I noticed after moving into the Highwood Street apartment last week.'],
        ['detail', 'Recently, the bathroom faucet has developed a steady leak that I cannot stop.'],
        ['impact', 'The dripping keeps me awake at night, and I am concerned about wasting water. In addition, the front-door bell does not work, so delivery drivers cannot tell me when they arrive.'],
        ['request', 'Would it be possible to arrange repairs for both problems this week? I will be home after 3 p.m. each day and can let the technician in.'],
        ['close', 'Thank you for your help.\n\nSincerely,\nJin Ryan']
      ],
      notes: [
        ['Greeting', 'Match title and relationship; do not invent an address block.'],
        ['Purpose', 'Name the message goal early so the reader never has to infer it.'],
        ['Detail + impact', 'Observable facts create elaboration; consequences explain urgency.'],
        ['Request', 'Ask for a concrete action and make the next step easy.'],
        ['Close', 'Keep it brief and appropriate for a landlord or administrator.']
      ]
    },
    'email-status': {
      kind: 'email', eyebrow: 'FORMAL EMAIL · STATUS + CLARIFICATION', title: 'Positive context → failure point → confirmation',
      source: 'Prompt adapted from ETS Practice Test 1', sourceUrl: ETS_PRACTICE + '#page=30', wordCount: 133,
      prompt: 'A poetry magazine received two submissions through an unreliable online form. Praise the publication, explain the issue, and ask about submission status.',
      skeleton: [
        ['greeting', 'Dear [role/name],'], ['purpose', 'I have enjoyed [specific positive detail], and I’m writing about [purpose].'],
        ['detail', 'When I [action], [exact failure].'], ['impact', 'As a result, I could not tell whether [uncertain outcome].'],
        ['request', 'Could you please confirm [specific status]? If not, would you advise me to [next step]?'], ['close', 'Thank you for your assistance. Best regards, [name]']
      ],
      response: [
        ['greeting', 'Dear Editor,'],
        ['purpose', 'I have enjoyed the magazine’s mix of new and established poets, and I’m writing about two poems I submitted on Monday.'],
        ['detail', 'After I selected “Submit,” the page continued loading for several minutes and never displayed a confirmation number.'],
        ['impact', 'As a result, I could not tell whether the files and my contact information reached your system.'],
        ['request', 'Could you please confirm whether you received “Night Bus” and “Paper Birds”? If they are missing, would you advise me to submit them again or send them by email?'],
        ['close', 'Thank you for your assistance.\n\nBest regards,\nMaya Chen']
      ],
      notes: [
        ['Positive context', 'A specific compliment completes the first bullet without empty flattery.'],
        ['Failure point', 'Name the action and visible result; “the website failed” is too vague.'],
        ['Status request', 'Identify exactly what must be confirmed.'],
        ['Fallback', 'A conditional next step makes the email practical and complete.']
      ]
    },
    'email-peer': {
      kind: 'email', eyebrow: 'SEMI-FORMAL EMAIL · PEER COORDINATION', title: 'Conflict → alternative → contribution',
      source: 'Original ETS-aligned practice model', sourceUrl: ETS_WRITING, wordCount: 128,
      prompt: 'You cannot attend your environmental club’s Monday planning meeting. Explain why, propose another time, and offer another way to help.',
      skeleton: [
        ['greeting', 'Hi [first name],'], ['purpose', 'I’m looking forward to [shared activity], but I won’t be able to [conflict].'],
        ['detail', 'I have to [brief, credible reason].'], ['request', 'Could we [specific alternative]?'],
        ['impact', 'If that does not work, I can still [concrete contribution].'], ['close', 'Thanks for understanding. Best, [name]']
      ],
      response: [
        ['greeting', 'Hi Sarah,'],
        ['purpose', 'I’m looking forward to the campus cleanup, but I won’t be able to attend Monday’s planning meeting.'],
        ['detail', 'I have a required laboratory session that ends at 7 p.m., and my instructor cannot offer another session this week.'],
        ['request', 'Could we meet Tuesday after 6 p.m. instead, or could you send me the main decisions afterward?'],
        ['impact', 'If rescheduling is difficult, I can still contact the campus radio station, draft the volunteer announcement, and update the club page before Wednesday.'],
        ['close', 'Thanks for understanding.\n\nBest,\nNadia']
      ],
      notes: [
        ['Tone', 'First-name greeting and contractions fit a familiar club leader.'],
        ['Reason', 'One concise explanation is enough; avoid an apology paragraph.'],
        ['Alternative', 'Offer a time the reader can actually accept or reject.'],
        ['Contribution', 'Specific tasks show cooperation even if the meeting cannot move.']
      ]
    },
    'discussion-extend': {
      kind: 'discussion', eyebrow: 'ACADEMIC DISCUSSION · AGREE + EXTEND', title: 'Position → connection → new condition',
      source: 'Prompt adapted from ETS Practice Test 1', sourceUrl: ETS_PRACTICE + '#page=31', wordCount: 137,
      prompt: 'Should high schools require volunteer work? One student values civic responsibility; another worries about students with jobs or family duties.',
      skeleton: [
        ['claim', 'I believe [clear position].'], ['connect', 'I agree with [student] that [accurate connection], but I would add [new angle].'],
        ['reason', 'The main reason is [mechanism].'], ['evidence', 'For example, [specific illustration].'],
        ['counter', 'Although [reasonable concern], [condition or solution].'], ['close', 'Therefore, [refined conclusion].']
      ],
      response: [
        ['claim', 'I believe high schools should require a modest amount of volunteer work.'],
        ['connect', 'I agree with Claire that service can build civic responsibility, but the requirement should also teach students how to choose a role that fits their strengths.'],
        ['reason', 'When students select a meaningful placement, the work feels less like a graduation obstacle and more like practical learning.'],
        ['evidence', 'For example, a student interested in technology could help a community center teach basic computer skills instead of completing an unrelated assignment.'],
        ['counter', 'Andrew is right that some teenagers have jobs or care for siblings, so schools should offer weekend, summer, and school-based options rather than impose one rigid schedule.'],
        ['close', 'With that flexibility, required service can be educational without creating unfair pressure.']
      ],
      notes: [
        ['Position', 'Answer the professor before discussing anyone else.'],
        ['Connection', 'Use a student idea as a launch point, not as your whole response.'],
        ['New contribution', 'The student-choice condition advances the discussion.'],
        ['Counter', 'A fair concession plus a solution shows nuance and control.']
      ]
    },
    'discussion-qualify': {
      kind: 'discussion', eyebrow: 'ACADEMIC DISCUSSION · QUALIFY + COUNTER', title: 'Partial agreement → boundary → stronger rule',
      source: 'Original ETS-aligned practice model', sourceUrl: ETS_WRITING, wordCount: 136,
      prompt: 'Should universities automatically record every lecture? One student values access; another predicts lower attendance.',
      skeleton: [
        ['claim', 'I support [idea], but only when [boundary].'], ['connect', '[Student] correctly points out [benefit/concern].'],
        ['reason', 'However, [mechanism showing why a blanket rule fails].'], ['evidence', 'For instance, [concrete case].'],
        ['counter', 'A better policy would [balanced alternative].'], ['close', 'This would [two-part result].']
      ],
      response: [
        ['claim', 'I support recording lectures, but I would not make publication automatic in every class.'],
        ['connect', 'Mina correctly points out that recordings help students who are ill or reviewing difficult material.'],
        ['reason', 'However, a blanket rule can create privacy and participation problems when a class includes personal discussion, student presentations, or unpublished research.'],
        ['evidence', 'For instance, students in a counseling seminar may speak less honestly if every comment becomes a permanent video.'],
        ['counter', 'A better policy would let instructors record lecture-heavy sessions while pausing during sensitive discussions, and it could limit access to enrolled students for a short period.'],
        ['close', 'This approach preserves academic access without treating every classroom interaction as public content.']
      ],
      notes: [
        ['Qualified claim', '“Yes, but” is precise when the prompt invites a policy judgment.'],
        ['Boundary', 'Explain exactly where the general rule becomes harmful.'],
        ['Example', 'A concrete seminar makes the privacy concern believable.'],
        ['Alternative', 'End by replacing the weak rule with a workable one.']
      ]
    }
  };

  const writingModels = [
    {
      badge: 'TONE SWAP', title: 'Professor deadline request',
      prompt: 'Explain a medical appointment, describe progress, and request a 24-hour extension.',
      moves: ['Dear Professor Malik,', 'I’m writing to request…', 'I have completed…', 'Would it be possible…', 'Thank you for considering…'],
      tip: 'Specific progress and a narrow request sound responsible; a vague emergency plus an open-ended delay does not.'
    },
    {
      badge: 'DISCUSSION MOVE', title: 'Agree—but change the mechanism',
      prompt: 'A student supports free public transit because it reduces pollution.',
      moves: ['I share Leo’s goal…', 'However, price alone may not…', 'Reliable frequency is the key…', 'For example…', 'Therefore, cities should pair…'],
      tip: 'You can agree with the conclusion while contributing a different reason or implementation condition.'
    },
    {
      badge: 'FAST ELABORATION', title: 'Turn a claim into evidence',
      prompt: 'Weak: “Group projects teach teamwork.”',
      moves: ['Mechanism: students divide roles', 'Moment: one member misses a deadline', 'Action: the group reallocates work', 'Result: planning and communication improve'],
      tip: 'One causal chain is usually more convincing than three unsupported benefits.'
    }
  ];

  const speakingTemplates = {
    opinion: {
      eyebrow: 'OPINION / PREFERENCE', title: 'Answer → reason → example → result',
      prompt: 'Would you prefer to exercise alone or with other people? Why?',
      source: 'Official ETS Teacher Practice Test 2 theme', sourceUrl: ETS_TEACHER_2 + '#page=36',
      plan: [['answer', 'Direct choice'], ['reason', 'One mechanism'], ['example', 'Specific moment'], ['result', 'Consequence + close']],
      script: [
        ['answer', 'I prefer exercising with one or two other people.'],
        ['reason', 'The main reason is accountability: when someone expects me to arrive, I am much less likely to skip the session.'],
        ['example', 'For example, my neighbor and I run on Tuesday mornings. Last winter, I often wanted to stay home because it was cold, but I still went because she was waiting outside. We also encouraged each other to finish the final kilometer.'],
        ['result', 'As a result, I exercised more consistently and enjoyed the routine more than when I trained alone.']
      ],
      coaching: ['Do not restate both options.', 'One developed example can carry the response.', 'A final result makes the example relevant.']
    },
    experience: {
      eyebrow: 'EXPERIENCE / MEMORY', title: 'Scene → action → outcome → reflection',
      prompt: 'Describe a friend you had as a child. How did you meet, and what did you do together?',
      source: 'Official ETS Speaking lesson plan practice', sourceUrl: ETS_SPEAKING + '#page=12',
      plan: [['answer', 'Scene + person'], ['reason', 'How it began'], ['example', 'One vivid action'], ['result', 'Outcome + reflection']],
      script: [
        ['answer', 'My closest childhood friend was Arman, who lived in the apartment above mine.'],
        ['reason', 'We met when his football rolled onto our balcony and he came downstairs to ask for it.'],
        ['example', 'After that, we spent most summer evenings building small model cars and racing them in the hallway. One car kept turning left, so we took it apart together and discovered that one wheel was loose.'],
        ['result', 'Fixing it made us feel like real engineers, and that friendship is probably why I still enjoy solving practical problems with other people.']
      ],
      coaching: ['Anchor the story in one time and place.', 'Use one action sequence—not a life history.', 'End with what changed or why the memory matters.']
    },
    routine: {
      eyebrow: 'ROUTINE / LIFESTYLE', title: 'Headline → pattern → example → benefit',
      prompt: 'Describe the type of exercise you or someone you know does regularly. Why?',
      source: 'Official ETS Teacher Practice Test 2', sourceUrl: ETS_TEACHER_2 + '#page=36',
      plan: [['answer', 'Routine headline'], ['reason', 'Pattern + reason'], ['example', 'Typical instance'], ['result', 'Practical benefit']],
      script: [
        ['answer', 'I usually take a brisk walk for about forty minutes after dinner.'],
        ['reason', 'I chose walking because it requires no equipment and fits naturally between work and evening study.'],
        ['example', 'On weekdays, I follow a route through a nearby park and listen to one short podcast. If I have been sitting all day, the first ten minutes help me release that physical tension, and the podcast keeps the routine interesting.'],
        ['result', 'By the time I return home, I can concentrate better and I am also more likely to sleep well.']
      ],
      coaching: ['State frequency or pattern early.', 'Add sensory or logistical detail.', 'Explain why this routine works for the person.']
    },
    solution: {
      eyebrow: 'SOLUTION / PREDICTION', title: 'Position → mechanism → illustration → close',
      prompt: 'Should city governments create more parks to improve residents’ happiness? Why or why not?',
      source: 'Official ETS Practice Test 1 · urban life interview', sourceUrl: ETS_PRACTICE + '#page=35',
      plan: [['answer', 'Clear policy position'], ['reason', 'How it works'], ['example', 'Concrete use case'], ['result', 'Limit or outcome']],
      script: [
        ['answer', 'Yes, city governments should create more parks, especially in dense neighborhoods.'],
        ['reason', 'Green spaces improve daily life because they give residents a free place to exercise, rest, and meet other people without needing to travel across the city.'],
        ['example', 'Near my previous apartment, a small unused lot became a park with trees and benches. Older residents began walking there in the morning, while families used it after school, so people who had never spoken started recognizing one another.'],
        ['result', 'Parks cannot solve every urban problem, but even a modest one can reduce stress and strengthen a neighborhood.']
      ],
      coaching: ['Give the policy answer immediately.', 'Explain a mechanism, not just “parks are good.”', 'A measured final sentence sounds more thoughtful than an absolute claim.']
    }
  };

  let activeFilter = 'all';
  let activeTaskId = tasks[0].id;

  function markupSegments(segments) {
    return segments.map(([type, text]) => text.split('\n').map(line => line
      ? `<mark class="move-${type}">${line}</mark>`
      : '<span class="response-line-gap" aria-hidden="true"></span>'
    ).join('<br />')).join(' ');
  }

  function renderTaskIndex() {
    const list = document.getElementById('task-index-list');
    const visible = tasks.filter(task => activeFilter === 'all' || task.section === activeFilter);
    if (!visible.some(task => task.id === activeTaskId)) activeTaskId = visible[0].id;
    document.getElementById('visible-task-count').textContent = `${visible.length} visible`;
    list.innerHTML = visible.map(task => {
      const meta = sectionMeta[task.section];
      return `<button type="button" class="task-index-button ${task.id === activeTaskId ? 'active' : ''}" data-task-id="${task.id}" aria-current="${task.id === activeTaskId ? 'true' : 'false'}">
        <span class="task-index-number">${task.number}</span>
        <span><small>${meta.label}</small><b>${task.title}</b><em>${task.summary}</em></span>
        <i>→</i>
      </button>`;
    }).join('');
    list.querySelectorAll('[data-task-id]').forEach(button => {
      button.addEventListener('click', () => {
        activeTaskId = button.dataset.taskId;
        renderTaskIndex();
        renderTaskDetail();
        if (window.matchMedia('(max-width: 820px)').matches) document.getElementById('task-detail').scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  function renderTaskDetail() {
    const task = tasks.find(item => item.id === activeTaskId) || tasks[0];
    const meta = sectionMeta[task.section];
    const detail = document.getElementById('task-detail');
    detail.className = `task-detail detail-${task.section}`;
    detail.innerHTML = `
      <header class="task-detail-head">
        <span class="detail-letter">${meta.letter}</span>
        <div><small>${task.number} / 12 · ${task.tag}</small><h3>${task.title}</h3><p>${task.summary}</p></div>
      </header>
      <p class="detail-description">${task.description}</p>
      <div class="detail-facts">${task.facts.map(fact => `<span>✓ ${fact}</span>`).join('')}</div>
      <div class="detail-columns">
        <section><span class="detail-label">WHAT ETS MEASURES</span>${task.measures.map(item => `<p>${item}</p>`).join('')}</section>
        <section class="detail-workflow"><span class="detail-label">REPEATABLE WORKFLOW</span>${task.workflow.map((item, index) => `<p><b>${index + 1}</b>${item}</p>`).join('')}</section>
        <section class="detail-traps"><span class="detail-label">COMMON TRAPS</span>${task.traps.map(item => `<p>${item}</p>`).join('')}</section>
      </div>
      <section class="example-desk">
        <div class="example-desk-head"><span>${task.example.label}</span><a href="${task.example.url}" target="_blank" rel="noreferrer">${task.example.source} ↗</a></div>
        <blockquote>${task.example.prompt}</blockquote>
        <div class="example-answer">${task.example.answer}</div>
        <p>${task.example.note}</p>
      </section>`;
  }

  function selectFilter(section) {
    activeFilter = Object.prototype.hasOwnProperty.call(sectionMeta, section) ? section : 'all';
    document.querySelectorAll('[data-section-filter]').forEach(button => {
      const active = button.dataset.sectionFilter === activeFilter;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    renderTaskIndex();
    renderTaskDetail();
  }

  function renderWritingTemplate(id) {
    const item = writingTemplates[id] || writingTemplates['email-problem'];
    const board = document.getElementById('writing-template-board');
    const legend = item.kind === 'email'
      ? [['greeting', 'Greeting'], ['purpose', 'Purpose'], ['detail', 'Task detail'], ['impact', 'Impact / elaboration'], ['request', 'Request / action'], ['close', 'Close']]
      : [['claim', 'Position'], ['connect', 'Discussion link'], ['reason', 'Reason / mechanism'], ['evidence', 'Evidence'], ['counter', 'Qualification'], ['close', 'Conclusion']];
    const plainSkeleton = item.skeleton.map(([, text]) => text).join(' ');
    board.innerHTML = `
      <aside class="template-legend-panel">
        <span>TEMPLATE KEY</span>
        <h3>${item.eyebrow}</h3>
        <div class="template-key">${legend.map(([type, label]) => `<p><i class="move-${type}"></i><b>${label}</b></p>`).join('')}</div>
        <button type="button" class="copy-template" data-copy-text="${plainSkeleton.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}">Copy blank framework</button>
        <small id="copy-status" aria-live="polite">Adapt the moves—never memorize the content.</small>
      </aside>
      <div class="template-work">
        <header><div><span>${item.eyebrow}</span><h3>${item.title}</h3></div><div class="word-chip">${item.wordCount} words</div></header>
        <div class="template-source"><b>PROMPT</b><p>${item.prompt}</p><a href="${item.sourceUrl}" target="_blank" rel="noreferrer">${item.source} ↗</a></div>
        <section class="blank-template"><span>FLEXIBLE FRAMEWORK</span><p>${markupSegments(item.skeleton)}</p></section>
        <section class="annotated-response"><span>ANNOTATED MODEL</span><p>${markupSegments(item.response)}</p></section>
        <div class="move-notes">${item.notes.map(([name, text], index) => `<article><b>${String(index + 1).padStart(2, '0')} · ${name}</b><p>${text}</p></article>`).join('')}</div>
      </div>`;
    board.querySelector('.copy-template').addEventListener('click', async event => {
      const text = event.currentTarget.dataset.copyText;
      const status = board.querySelector('#copy-status');
      try {
        await navigator.clipboard.writeText(text);
        status.textContent = 'Framework copied. Replace every bracket with prompt-specific content.';
      } catch {
        status.textContent = 'Copy was unavailable; select the framework text manually.';
      }
    });
  }

  function renderWritingModels() {
    document.getElementById('writing-model-grid').innerHTML = writingModels.map(model => `<article>
      <span>${model.badge}</span><h4>${model.title}</h4><p>${model.prompt}</p>
      <div>${model.moves.map(move => `<b>${move}</b>`).join('<i>→</i>')}</div><small>${model.tip}</small>
    </article>`).join('');
  }

  function renderSpeakingTemplate(id) {
    const item = speakingTemplates[id] || speakingTemplates.opinion;
    const board = document.getElementById('speaking-script-board');
    board.innerHTML = `
      <header><div><span>${item.eyebrow}</span><h3>${item.title}</h3></div><button type="button" class="play-script">▶ Hear model</button></header>
      <div class="speaking-prompt"><span>INTERVIEWER</span><p>${item.prompt}</p><a href="${item.sourceUrl}" target="_blank" rel="noreferrer">${item.source} ↗</a></div>
      <div class="speech-plan">${item.plan.map(([type, text], index) => `<span class="move-${type}"><b>${index + 1}</b>${text}</span>`).join('<i>→</i>')}</div>
      <div class="highlighted-script"><span>HIGHLIGHTED RESPONSE SCRIPT</span><p>${markupSegments(item.script)}</p></div>
      <div class="speech-legend"><span><i class="move-answer"></i>answer / scene</span><span><i class="move-reason"></i>reason / action</span><span><i class="move-example"></i>example</span><span><i class="move-result"></i>result / reflection</span></div>
      <div class="speech-coaching">${item.coaching.map(point => `<p>✓ ${point}</p>`).join('')}</div>`;
    board.querySelector('.play-script').addEventListener('click', event => {
      const text = item.script.map(([, value]) => value).join(' ');
      speak(text, event.currentTarget);
    });
  }

  function speak(text, button) {
    if (!('speechSynthesis' in window)) {
      button.textContent = 'Audio unavailable';
      return;
    }
    if (!button.dataset.idleLabel) button.dataset.idleLabel = button.textContent;
    const resetButton = target => {
      target.dataset.speaking = 'false';
      target.classList.remove('is-speaking');
      target.setAttribute('aria-pressed', 'false');
      target.textContent = target.dataset.idleLabel || '▶ Hear model';
    };
    if (button.dataset.speaking === 'true') {
      window.speechSynthesis.cancel();
      resetButton(button);
      return;
    }
    document.querySelectorAll('[data-speaking="true"]').forEach(resetButton);
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    utterance.pitch = 1;
    button.dataset.speaking = 'true';
    button.classList.add('is-speaking');
    button.setAttribute('aria-pressed', 'true');
    button.textContent = '■ Stop';
    utterance.onend = () => resetButton(button);
    utterance.onerror = () => resetButton(button);
    window.speechSynthesis.speak(utterance);
  }

  function bindTabs() {
    document.querySelectorAll('[data-section-filter]').forEach(button => button.addEventListener('click', () => selectFilter(button.dataset.sectionFilter)));

    document.querySelectorAll('[data-writing-template]').forEach(button => button.addEventListener('click', () => {
      document.querySelectorAll('[data-writing-template]').forEach(item => {
        const active = item === button;
        item.classList.toggle('active', active);
        item.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      renderWritingTemplate(button.dataset.writingTemplate);
    }));

    document.querySelectorAll('[data-speaking-template]').forEach(button => button.addEventListener('click', () => {
      document.querySelectorAll('[data-speaking-template]').forEach(item => item.classList.toggle('active', item === button));
      renderSpeakingTemplate(button.dataset.speakingTemplate);
    }));

    document.querySelectorAll('[data-jump-section]').forEach(link => link.addEventListener('click', () => {
      const section = link.dataset.jumpSection;
      window.setTimeout(() => selectFilter(section), 100);
    }));

    const repeatText = document.getElementById('repeat-sample-text');
    const repeatToggle = document.getElementById('toggle-repeat-text');
    document.getElementById('play-repeat-sample').addEventListener('click', event => {
      speak('For those with children, we offer summer camps and educational opportunities.', event.currentTarget);
    });
    repeatToggle.addEventListener('click', () => {
      const hidden = repeatText.classList.toggle('recall-hidden');
      repeatToggle.textContent = hidden ? 'Reveal chunked text' : 'Hide text for recall';
    });
  }

  function applyInitialRoute() {
    const params = new URLSearchParams(window.location.search);
    const requestedTask = params.get('task');
    const requestedSection = params.get('section');
    if (requestedTask && tasks.some(task => task.id === requestedTask)) {
      activeTaskId = requestedTask;
      activeFilter = tasks.find(task => task.id === requestedTask).section;
    } else if (requestedSection && sectionMeta[requestedSection]) {
      activeFilter = requestedSection;
      activeTaskId = tasks.find(task => task.section === requestedSection).id;
    }
  }

  function init() {
    applyInitialRoute();
    bindTabs();
    selectFilter(activeFilter);
    renderWritingTemplate('email-problem');
    renderWritingModels();
    renderSpeakingTemplate('opinion');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
