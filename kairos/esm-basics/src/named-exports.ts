export let moduleLoadCount = 0;

moduleLoadCount++;

export const topicName = 'esm modules';

export function uppercaseTopicName(topic: string): string {
  return topic.toUpperCase();
}
