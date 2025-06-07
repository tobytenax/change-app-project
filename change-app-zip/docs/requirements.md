# Change App Requirements Document

## Introduction

The Change App is envisioned as a revolutionary digital platform that combines elements of an online forum with mechanisms for direct democracy. It aims to create a system where users can propose ideas, vote on them, and see them potentially implemented at various levels of society, from neighborhoods to global scale. The platform incorporates a unique competence verification system to ensure informed voting, a token economy to incentivize participation, and a hierarchical scaling mechanism to allow proposals to gain traction from local to global levels.

This document outlines the comprehensive requirements for the Change App, detailing both functional and non-functional aspects that will guide its development.

## Core Functional Requirements

### User Registration and Identity Management

The Change App requires a robust user registration and identity management system. While not explicitly detailed in the initial requirements, it is fundamental to the platform's operation. Users must have unique identities within the system to participate in voting, delegation, and other activities. The identity system should:

1. Allow users to create accounts with unique identifiers
2. Support secure authentication mechanisms
3. Store basic profile information
4. Associate users with geographical or organizational boundaries (neighborhoods, cities, etc.)
5. Track user activity, participation history, and coin balance

The identity system forms the foundation upon which all other features of the platform are built, ensuring accountability and proper tracking of user actions.

### Competence Verification System (Quiz System)

A cornerstone of the Change App is its competence verification mechanism, which ensures that users are informed about topics before voting on related proposals. This system must:

1. Create and store quiz questions associated with specific proposals or topics
2. Present these quizzes to users who wish to vote directly on proposals
3. Record user attempts and scores
4. Determine pass/fail status based on predefined competence criteria
5. Securely store and retrieve this status for future reference
6. Award coins to users who successfully pass quizzes
7. Prevent users who fail quizzes from voting directly (though they may delegate)
8. Allow users to retake quizzes if they initially fail

The quiz system serves as a gatekeeper for direct voting, ensuring that decisions are made by users who have demonstrated at least basic knowledge of the relevant topics.

### Voting Mechanism

The voting mechanism is central to the platform's democratic function. It must:

1. Allow qualified users (those who have passed the relevant quiz) to cast a single vote (for or against) per proposal
2. Securely record each vote associated with the specific user and proposal
3. Prevent duplicate or unauthorized voting
4. Award coins to users who cast votes, regardless of their stance
5. Track vote counts accurately for each proposal
6. Calculate and display voting results
7. Implement time limits or other closing mechanisms for voting periods
8. Support the hierarchical scaling system by tracking vote thresholds at each level

The voting system must be secure, transparent, and resistant to manipulation to maintain the integrity of the democratic process.

### Delegation System

The delegation system allows users who fail quizzes to participate indirectly by delegating their voting power to qualified users. This system must:

1. Enable users who have failed a quiz to designate another qualified user as their delegate for a specific proposal
2. Track the delegation relationship (delegator, delegatee, proposal scope)
3. Award coins to both the delegator and delegatee when the delegatee casts a vote that includes delegated votes
4. Ensure that delegated votes are counted appropriately in the final tally
5. Prevent circular delegations or other potential abuses of the system
6. Provide transparency about delegation relationships

The delegation system ensures that all users can participate in the democratic process, even if they cannot or choose not to pass the competence verification for a particular topic.

### Delegation Revocation

The platform must support the revocation of delegations with specific economic consequences. This feature must:

1. Allow delegators to revoke their delegation at any time without requiring a quiz
2. Apply a penalty to the revoker (loss of the coin earned from delegation)
3. Provide a path for users to regain the lost coin (by passing the quiz and voting themselves)
4. Award an additional coin as incentive for users who take this path
5. Enforce a time-based restriction (one year) on earning coins from subsequent redelegations
6. Track and manage these complex state changes and time-based rules

The delegation revocation system adds nuance to the delegation process, discouraging frivolous changes while still allowing users to reclaim their direct voting power if they become more informed about a topic.

### Proposal System

The proposal system is where ideas are introduced to the community. It must:

1. Allow users to submit new proposals with text, metadata, and potentially other media
2. Charge proposers a fee (5 coins) for creating proposals
3. Track each proposal's content, status (active, closed), and associated votes
4. Calculate and award compensation to proposers based on the number of 'yes' votes received (1 coin per 'yes' vote)
5. Support the hierarchical scaling system by associating proposals with specific geographical or organizational scopes
6. Provide mechanisms for proposal authors to update or clarify their proposals
7. Implement appropriate lifecycle management for proposals (creation, voting period, closure, potential escalation)

The proposal system is the starting point for all democratic action within the platform, providing a structured way for users to introduce ideas for consideration.

### Hierarchical Scaling System

This complex feature allows proposals to start locally and potentially scale to global impact. It must:

1. Define clear geographical or organizational boundaries (neighborhood, city, state, region, country, worldwide, potentially beyond)
2. Present proposals initially within a limited scope (typically neighborhood)
3. Track support levels (vote counts, participation rates) within each scope
4. Implement logic to escalate proposals to the next level upon reaching predefined thresholds
5. Manage user association with these various scopes
6. Ensure appropriate visibility of proposals based on their current scope and the user's location
7. Handle the increased complexity of voting and delegation as proposals scale to wider audiences

The hierarchical scaling system embodies the platform's vision of grassroots democracy, allowing good ideas to gain momentum and potentially achieve wide-reaching implementation.

### Commenting System

The commenting system allows users to provide feedback, suggestions, and discussion on proposals. It must:

1. Allow users to post comments associated with specific proposals
2. Charge a fee (3 coins) for commenting
3. Enable upvoting and downvoting of comments by other users
4. Award 1 coin to users who vote on comments (regardless of whether it's an upvote or downvote)
5. Calculate and track a revenue share (10% of proposal revenue per upvote) for commenters
6. Display comments in a structured, navigable format
7. Support potential moderation features to maintain quality discourse

The commenting system enriches the democratic process by allowing for detailed discussion and refinement of proposals beyond simple yes/no voting.

### Comment Integration

This feature allows proposal authors to formally incorporate suggestions from comments. It must:

1. Provide a mechanism for proposal authors to mark specific comments as "integrated" into their proposal
2. Trigger a final payout to the commenter based on accrued upvotes when integration occurs
3. Stop further revenue accrual for integrated comments
4. Potentially track and display how the proposal has evolved through these integrations
5. Maintain a history of which comments influenced the final proposal

The comment integration system creates a collaborative refinement process for proposals, incentivizing constructive feedback and allowing proposals to improve based on community input.

### Token System ("Coins")

The token system underpins the platform's economy, incentivizing participation and regulating certain actions. It must:

1. Maintain an accurate, consistent ledger of coin balances for all users
2. Process all specified coin transactions reliably:
   - Earning via passing quizzes (1 coin)
   - Earning via voting (1 coin)
   - Earning via delegation (1 coin for delegator, 1 coin for delegatee)
   - Earning via comment votes (1 coin)
   - Earning via proposal 'yes' votes (1 coin per 'yes' vote for proposer)
   - Earning via comment upvotes (10% of proposal revenue per upvote)
   - Spending on proposals (5 coins)
   - Spending on comments (3 coins)
   - Penalties for delegation revocation (loss of 1 coin)
3. Prevent double-spending and ensure ledger integrity
4. Display current balances to users
5. Potentially support additional economic features like coin transfers or other incentive mechanisms

The token system creates a self-sustaining economy within the platform, where participation is rewarded and certain high-impact actions require investment, helping to ensure quality contributions.

## Non-Functional Requirements

### Consistency

Consistency is paramount for the Change App, particularly for voting and tokenomics:

1. Voting requires finality (knowing the definitive outcome) and integrity (preventing double voting or vote tampering)
2. The token system requires atomicity (transactions succeed or fail entirely) and prevention of double-spending
3. State changes must be consistent across the system, especially for critical operations like voting, delegation, and coin transactions
4. The system must maintain a single source of truth for all important data

Strong consistency guarantees are essential for maintaining user trust in the democratic and economic aspects of the platform.

### Scalability

The Change App must scale effectively to support its ambitious vision:

1. The system must handle growth in users, proposals, votes, and comments
2. The hierarchical scaling model demands infrastructure that can support potentially global reach
3. Performance must remain acceptable even as the user base and activity levels grow
4. Database design must accommodate increasing data volumes without degradation
5. The architecture should support horizontal scaling to add capacity as needed

Scalability is critical given the platform's goal of potentially reaching global or even "interplanetary" scope.

### Availability and Persistence

The platform must maintain high availability and data persistence:

1. Proposals, vote records, comment threads, and coin balances must remain accessible and durable
2. The system should be resilient to partial failures, with appropriate redundancy
3. Data backup and recovery mechanisms must be robust
4. Service level objectives should aim for high uptime (99.9%+)
5. Geographically distributed infrastructure may be necessary to serve a global user base

Users must be able to rely on the platform being available when they need it, and they must trust that their contributions and coin balances will persist over time.

### Security

Security is essential for maintaining the integrity of the democratic process:

1. The system must protect against unauthorized actions (voting without qualification, spending unearned coins)
2. Data tampering (altering votes or balances) must be prevented
3. Identity verification and authentication must be robust
4. Protection against denial-of-service attacks is necessary
5. The system must defend against specific threats like Sybil attacks (where an attacker creates numerous fake identities)
6. Encryption should be used for sensitive data and communications

Security breaches could undermine the entire premise of the platform, making this a critical requirement.

### Performance

Users expect reasonable responsiveness for all actions:

1. Page loads and basic interactions should complete within 1-2 seconds
2. Vote casting, commenting, and other common actions should feel immediate to users
3. Background operations (like calculating revenue shares) can take longer but should not impact user experience
4. The system should handle peak loads without significant degradation
5. Caching and other optimization techniques should be employed where appropriate

Good performance is essential for user satisfaction and retention, particularly for a platform that aims to engage users in democratic processes.

### Determinism

The complex rules governing the platform must execute deterministically:

1. Given the same inputs and state, the system must always produce the same outputs
2. All nodes or instances of the system must converge to identical states when processing the same events
3. Transaction ordering must be consistent and predictable
4. Edge cases and race conditions must be handled gracefully and consistently

Determinism ensures that the platform behaves predictably and fairly for all users, regardless of implementation details or deployment configuration.

### Usability

While not explicitly mentioned in the initial requirements, usability is crucial for adoption:

1. The interface should be intuitive and accessible to users with varying levels of technical expertise
2. The complex rules of the platform should be clearly explained and easily understood
3. Users should receive clear feedback about the results of their actions
4. The platform should work well on various devices and screen sizes
5. Accessibility features should be incorporated to ensure the platform is usable by people with disabilities

A platform aimed at democratic participation must be accessible to as many people as possible, making usability a key requirement.

### Compliance and Legal Considerations

The platform must address various legal and regulatory concerns:

1. Data privacy regulations (like GDPR) must be respected
2. Terms of service and privacy policies must be clear and comprehensive
3. The token system may have implications under financial regulations that need to be addressed
4. Content moderation policies must be developed to prevent illegal or harmful content
5. The platform should be designed with ethical considerations in mind

Compliance ensures that the platform can operate legally in various jurisdictions and protects both users and operators from potential legal issues.

## Conclusion

The Change App represents an ambitious vision for combining online discussion with direct democracy, enhanced by competence verification and economic incentives. The requirements outlined in this document provide a comprehensive foundation for developing a platform that can fulfill this vision while addressing the complex technical, social, and economic challenges involved.

The development approach must carefully balance these requirements, prioritizing the core functional features while ensuring that the non-functional requirements are met to create a platform that is not only feature-rich but also reliable, scalable, secure, and user-friendly.
