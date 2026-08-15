package main

import "fmt"

func main() {
	fmt.Println("__KAIRO_TITLE__")
	fmt.Println(starterMessage())
}

func starterMessage() string {
	return "A tiny Go kairo is wired up and ready."
}
