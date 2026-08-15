package main

import "fmt"

type Topic struct {
	Name string
	Done bool
}

func main() {
	topics := []Topic{
		{Name: "variables and types", Done: true},
		{Name: "control flow", Done: true},
		{Name: "functions", Done: false},
	}

	fmt.Println("Go basics")
	fmt.Println("==========")

	for _, topic := range topics {
		fmt.Printf("[%s] %s\n", marker(topic.Done), topic.Name)
	}

	fmt.Printf("status: %s\n", studyStatus(topics))
}

func marker(done bool) string {
	if done {
		return "x"
	}

	return " "
}

func countCompleted(topics []Topic) int {
	count := 0

	for _, topic := range topics {
		if topic.Done {
			count++
		}
	}

	return count
}

func studyStatus(topics []Topic) string {
	completed := countCompleted(topics)

	switch {
	case len(topics) == 0:
		return "not started"
	case completed == len(topics):
		return "complete"
	default:
		return fmt.Sprintf("%d/%d topics complete", completed, len(topics))
	}
}
