Auth:
email: exmaple@gmail.com
pass: 12345678

One sentence: what you would port next—and which half of it (logic or rendering) moves for free.

Next, I would port the user authentication and streak calculation logic, which moves 100% for free because business logic in custom React hooks is platform-agnostic, whereas rendering components must be updated to React Native primitives.