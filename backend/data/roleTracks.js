const roleTracks = {
  swe: {
    id: 'swe',
    label: 'Software Engineer',
    icon: '💻',
    color: 'blue',
    description: 'DS&A, system design, debugging, code quality',
    questions: [
      { id: 'swe1', category: 'technical', difficulty: 'medium', question: 'Explain the difference between a stack and a queue. When would you use each?', tips: ['Give concrete use cases', 'Mention time complexity'] },
      { id: 'swe2', category: 'technical', difficulty: 'hard',   question: 'How would you design a distributed key-value store like Redis?', tips: ['Cover consistency, partitioning, replication', 'Mention CAP theorem'] },
      { id: 'swe3', category: 'technical', difficulty: 'medium', question: 'What is the difference between concurrency and parallelism?', tips: ['Use an analogy', 'Give language-specific examples'] },
      { id: 'swe4', category: 'technical', difficulty: 'easy',   question: 'What is Big O notation and why does it matter?', tips: ['Give examples for O(n), O(log n), O(n²)', 'Explain best vs worst case'] },
      { id: 'swe5', category: 'technical', difficulty: 'hard',   question: 'How would you approach refactoring a large legacy codebase?', tips: ['Talk about testing first', 'Incremental vs big bang', 'Stakeholder communication'] },
      { id: 'swe6', category: 'technical', difficulty: 'medium', question: 'Explain the SOLID principles and give an example of one in practice.', tips: ['Don\'t just list them — pick one and go deep', 'Use a real code example'] },
      { id: 'swe7', category: 'behavioral', difficulty: 'medium', question: 'Tell me about a time you improved the performance of a system.', tips: ['Quantify the improvement', 'Explain how you found the bottleneck'] },
      { id: 'swe8', category: 'technical', difficulty: 'hard',   question: 'How does garbage collection work in a language you know well?', tips: ['Pick one language and go deep', 'Cover generational GC if Java/JVM'] },
      { id: 'swe9', category: 'technical', difficulty: 'medium', question: 'What is the difference between TCP and UDP? When would you use UDP?', tips: ['Cover reliability vs speed trade-off', 'Give examples: gaming, video streaming'] },
      { id: 'swe10', category: 'situational', difficulty: 'medium', question: 'A critical service you own goes down at 2am. Walk me through your incident response.', tips: ['Show a structured process', 'Cover communication, mitigation, post-mortem'] },
    ],
  },

  ml: {
    id: 'ml',
    label: 'ML Engineer',
    icon: '🧠',
    color: 'violet',
    description: 'Modelling, MLOps, data pipelines, deep learning',
    questions: [
      { id: 'ml1', category: 'technical', difficulty: 'medium', question: 'Explain the bias-variance tradeoff and how you would address high variance in a model.', tips: ['Use a learning curve diagram mentally', 'Mention regularisation, more data, simpler model'] },
      { id: 'ml2', category: 'technical', difficulty: 'hard',   question: 'How would you design an ML pipeline for a real-time fraud detection system?', tips: ['Cover feature engineering, latency constraints, retraining strategy'] },
      { id: 'ml3', category: 'technical', difficulty: 'medium', question: 'What is the difference between precision and recall? When would you optimise for each?', tips: ['Medical vs spam examples', 'Mention F1 score and PR curves'] },
      { id: 'ml4', category: 'technical', difficulty: 'hard',   question: 'Explain how transformers work and why attention is powerful.', tips: ['Cover self-attention at a high level', 'Compare to RNNs', 'Mention positional encoding'] },
      { id: 'ml5', category: 'technical', difficulty: 'medium', question: 'How do you handle class imbalance in a dataset?', tips: ['SMOTE, class weights, resampling', 'Mention evaluation metric choice'] },
      { id: 'ml6', category: 'technical', difficulty: 'easy',   question: 'What is overfitting and what are three techniques to prevent it?', tips: ['Dropout, early stopping, regularisation, data augmentation'] },
      { id: 'ml7', category: 'behavioral', difficulty: 'medium', question: 'Tell me about a model you built that failed in production. What did you learn?', tips: ['Be honest', 'Focus on the gap between offline and online metrics'] },
      { id: 'ml8', category: 'technical', difficulty: 'hard',   question: 'How would you monitor and detect model drift in production?', tips: ['Data drift vs concept drift', 'Statistical tests, shadow deployments'] },
      { id: 'ml9', category: 'technical', difficulty: 'medium', question: 'Explain gradient descent and the role of the learning rate.', tips: ['Cover SGD vs mini-batch', 'Mention adaptive optimisers like Adam'] },
      { id: 'ml10', category: 'situational', difficulty: 'medium', question: 'A stakeholder wants your model deployed in 2 weeks. You know it needs 2 months. What do you do?', tips: ['Show you can push back with data', 'Offer a phased rollout or baseline model first'] },
    ],
  },

  pm: {
    id: 'pm',
    label: 'Product Manager',
    icon: '📋',
    color: 'emerald',
    description: 'Product sense, metrics, prioritisation, stakeholders',
    questions: [
      { id: 'pm1', category: 'situational', difficulty: 'medium', question: 'How would you prioritise a backlog with 50 features and limited engineering resources?', tips: ['RICE or MoSCoW framework', 'Show you can say no', 'Tie to company goals'] },
      { id: 'pm2', category: 'situational', difficulty: 'hard',   question: 'Design a product to help remote teams collaborate more effectively.', tips: ['Start with user research questions', 'Cover personas, pain points, success metrics'] },
      { id: 'pm3', category: 'technical', difficulty: 'medium', question: 'A key product metric drops 20% overnight. How do you investigate?', tips: ['Structured debugging: segment by platform, region, user type', 'Check for data pipeline issues first'] },
      { id: 'pm4', category: 'behavioral', difficulty: 'medium', question: 'Tell me about a time you had to make a product decision with incomplete data.', tips: ['Show you can move forward under uncertainty', 'Mention how you validated later'] },
      { id: 'pm5', category: 'situational', difficulty: 'medium', question: 'How would you define success metrics for a new onboarding flow?', tips: ['Cover activation rate, time-to-value, drop-off points', 'Distinguish leading vs lagging indicators'] },
      { id: 'pm6', category: 'behavioral', difficulty: 'hard',   question: 'Tell me about a time engineering pushed back on your roadmap. How did you handle it?', tips: ['Show empathy for technical constraints', 'Show you found a middle ground'] },
      { id: 'pm7', category: 'situational', difficulty: 'easy',  question: 'How do you decide when a feature is ready to ship?', tips: ['Cover definition of done, quality bar, rollback plan'] },
      { id: 'pm8', category: 'situational', difficulty: 'hard',  question: 'Two equally important customers want conflicting features. What do you do?', tips: ['Show you can find the underlying need', 'Mention data to break the tie'] },
      { id: 'pm9', category: 'behavioral', difficulty: 'medium', question: 'How do you keep engineering, design, and business stakeholders aligned on a project?', tips: ['Talk about your communication cadence', 'Mention shared docs, demos, decision logs'] },
      { id: 'pm10', category: 'situational', difficulty: 'medium', question: 'Walk me through how you would run an A/B test for a new checkout flow.', tips: ['Cover hypothesis, sample size, duration, guardrail metrics, rollout'] },
    ],
  },
};

module.exports = roleTracks;
