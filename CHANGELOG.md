# @devsantara/head

## 0.3.0

### Minor Changes

- 134dd78: feat(title): add templated title support
- 59a43db: feat(script): extract src or inline source as dedicated parameter in addScript
- 3a925eb: feat(builder): implement element deduplication with map

  - Replace array-based element storage with Map for O(1) deduplication
  - Add getElementKey() method to generate unique keys based on element type and attributes
  - Elements with same key now replace previous ones instead of duplicating
  - Update build() method to convert Map to array format

- 59a43db: feat(link): extract href as dedicated parameter in addLink
- 72df9bc: fix(builder): missing manifest key and remove unused try-catch
- 59a43db: feat(style): extract inline css as dedicated parameter in addStyle

### Patch Changes

- 72df9bc: test: add test case to cover all codebase
- dfd1960: refactor(builder): explicitly return this and unify variable names

## 0.2.0

### Minor Changes

- ee72d0a: feat(meta): add description
- 56ef752: feat(meta): add charset
- dd53052: feat(builder): add resolve url helper and options fn
- c0e20db: feat(link): add canonical url
- 7e5157a: feat(meta): add color scheme
- 0af2019: feat(meta): add title
- b2ce4c4: feat(link): add icon
- 872c708: feat(meta): add robots
- a9a206a: feat(meta): add open graph
- 301648f: feat(meta): add twitter card
- b003262: feat(link): add alternate locale
- 385d1b3: feat(link): add manifest
- 4581cff: feat(link): add stylesheet
- 8e2ca3a: feat(meta): add viewport

### Patch Changes

- 43e7eb0: docs(code): improve jsdoc content
- 43e7eb0: docs(readme): improve structure and content

## 0.1.1

### Patch Changes

- 63b6f8f: docs(readme): add summary and usage

## 0.1.0

### Minor Changes

- 522b9d8: feat(builder): add simple general head constructor
