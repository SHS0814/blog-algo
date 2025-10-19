---
title: 'Intro: Studying Algorithms'
description: 'What I will cover in this blog and how I structure posts.'
pubDate: '2025-10-17'
heroImage: '../../assets/blog-placeholder-3.jpg'
tags: ['intro']
difficulty: easy
draft: false
---

Welcome to my algorithms study blog. I’ll post notes, proofs, and implementations.

Posts will include:

- Problem statement and intuition
- Time/space complexity
- Proof sketch or invariants
- Implementations in TypeScript/Python/C++

To render math, I can write inline like $O(n \log n)$ or display math:

$$
T(n) = 2\,T(n/2) + O(n) \implies T(n) = O(n\log n)
$$

And include code with highlighting:

```ts
export function binarySearch(arr: number[], target: number): number {
  let left = 0;
  let right = arr.length - 1;
  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1; else right = mid - 1;
  }
  return -1;
}
```

That’s the structure I’ll follow going forward.
