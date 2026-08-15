package main

import "testing"

func TestCountCompleted(t *testing.T) {
	topics := []Topic{
		{Name: "variables and types", Done: true},
		{Name: "control flow", Done: false},
		{Name: "functions", Done: true},
	}

	if got, want := countCompleted(topics), 2; got != want {
		t.Fatalf("countCompleted() = %d, want %d", got, want)
	}
}

func TestStudyStatus(t *testing.T) {
	tests := []struct {
		name   string
		topics []Topic
		want   string
	}{
		{name: "empty", want: "not started"},
		{
			name: "in progress",
			topics: []Topic{
				{Name: "variables and types", Done: true},
				{Name: "control flow", Done: false},
			},
			want: "1/2 topics complete",
		},
		{
			name: "complete",
			topics: []Topic{
				{Name: "variables and types", Done: true},
				{Name: "control flow", Done: true},
			},
			want: "complete",
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			if got := studyStatus(test.topics); got != test.want {
				t.Fatalf("studyStatus() = %q, want %q", got, test.want)
			}
		})
	}
}
