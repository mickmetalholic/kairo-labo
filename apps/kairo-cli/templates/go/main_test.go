package main

import "testing"

func TestStarter(t *testing.T) {
	if starterMessage() == "" {
		t.Fatal("the starter kairo should be ready")
	}
}
