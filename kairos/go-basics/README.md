# go-basics

A small, testable study-plan program for learning Go fundamentals.

## Core question

How do Go values move through a struct, a slice, a loop, and small functions?

## Run

From this directory:

```bash
go run .
go test ./...
```

From the repository root:

```bash
pnpm kairo run go-basics
```

## Read in this order

1. `Topic` in `main.go`: a struct groups related values.
2. `topics`: a slice stores several `Topic` values.
3. `for` and `if`: the program counts completed topics.
4. `studyStatus`: a function and `switch` turn the count into a message.
5. `main_test.go`: tests make the expected behavior explicit.

## Small experiments

- Change one `Done` value and run the program again.
- Add a topic and update the tests.
- Make `topics` empty and observe the `not started` branch.
- Add a test case before changing the implementation.

Pointers, interfaces, errors, packages, and goroutines are intentionally left
for later kairos.
