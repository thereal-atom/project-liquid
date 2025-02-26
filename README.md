# project liquid

**work in progress**

a bot and interface to optimize and automate risk reduction techniques regarding providing liquidity for yield farming purposes.

the principle is:

a user finds a high yield liquidity pool. it is likely a memecoin pool as they have high yields. the user opens a position for the liquidity pool through the project liquid UI.

what happens:
1. swap Solana to the second token in the pool (likely the meme coin)
2. solana and the token are deposited into the liquidity pool
3. 2 short positions are open, one for each token, each proportional to the amounts deposited in the liquidity pool.

as the ratio of the prices between the two tokens shifts, the quantity of each token changes. this can cause loss (in various ways), so in the project liquid backend, the shorts are rebalanced accordingly. the end result is that the shorts cover the losses from the liquidity position (or vice versa), and you are left with pure profit in the fees collected.