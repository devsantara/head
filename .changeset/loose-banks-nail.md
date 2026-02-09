---
'@devsantara/head': minor
---

feat(builder): implement element deduplication with map

- Replace array-based element storage with Map for O(1) deduplication
- Add getElementKey() method to generate unique keys based on element type and attributes
- Elements with same key now replace previous ones instead of duplicating
- Update build() method to convert Map to array format
