### Task 1: Add New Constants

**Files:**
- Modify: `src/constants.ts`
- Modify: `tests/constants.test.ts`

**Interfaces:**
- Produces: `LEG_TRUSS_WIDTH_BASE`, `LEG_TRUSS_WIDTH_TOP`, `LEG_TRUSS_BAY_HEIGHT`, `LEG_SECTION_HEIGHT`, `BODY_BAY_HEIGHT`, `ARCH_MAX_HEIGHT`, `ARCH_SEGMENTS`, `ARCH_RING_SPACING`

- [ ] **Step 1: Add tests for new constants to tests/constants.test.ts**

Append this test block to the existing file (after the last `it` block, before the closing `});` of the `describe('constants', ...)` block — or as a new describe block at the end of the file):

```typescript
describe('engineering-model constants', () => {
  it('has positive leg truss width at base', async () => {
    const { LEG_TRUSS_WIDTH_BASE } = await import('../src/constants');
    expect(LEG_TRUSS_WIDTH_BASE).toBeGreaterThan(0);
  });

  it('leg truss width narrows from base to top', async () => {
    const { LEG_TRUSS_WIDTH_BASE, LEG_TRUSS_WIDTH_TOP } = await import('../src/constants');
    expect(LEG_TRUSS_WIDTH_TOP).toBeLessThan(LEG_TRUSS_WIDTH_BASE);
    expect(LEG_TRUSS_WIDTH_TOP).toBeGreaterThan(0);
  });

  it('has positive leg truss bay height', async () => {
    const { LEG_TRUSS_BAY_HEIGHT } = await import('../src/constants');
    expect(LEG_TRUSS_BAY_HEIGHT).toBeGreaterThan(0);
  });

  it('leg section height equals first platform height', async () => {
    const { LEG_SECTION_HEIGHT, PLATFORM_HEIGHTS } = await import('../src/constants');
    expect(LEG_SECTION_HEIGHT).toBe(PLATFORM_HEIGHTS[0]);
  });

  it('has positive body bay height', async () => {
    const { BODY_BAY_HEIGHT } = await import('../src/constants');
    expect(BODY_BAY_HEIGHT).toBeGreaterThan(0);
  });

  it('has positive arch max height less than leg section height', async () => {
    const { ARCH_MAX_HEIGHT, LEG_SECTION_HEIGHT } = await import('../src/constants');
    expect(ARCH_MAX_HEIGHT).toBeGreaterThan(0);
    expect(ARCH_MAX_HEIGHT).toBeLessThan(LEG_SECTION_HEIGHT);
  });

  it('has positive arch segments', async () => {
    const { ARCH_SEGMENTS } = await import('../src/constants');
    expect(ARCH_SEGMENTS).toBeGreaterThan(4);
  });

  it('has positive arch ring spacing', async () => {
    const { ARCH_RING_SPACING } = await import('../src/constants');
    expect(ARCH_RING_SPACING).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — the new constants are not exported.

- [ ] **Step 3: Add the new constants to src/constants.ts**

Add these lines after the existing `AUTO_ROTATION_RECOVERY_S` line and before the validation block:

```typescript
export const LEG_TRUSS_WIDTH_BASE = 9.0;
export const LEG_TRUSS_WIDTH_TOP = 3.5;
export const LEG_TRUSS_BAY_HEIGHT = 3.0;
export const LEG_SECTION_HEIGHT = 57;
export const BODY_BAY_HEIGHT = 4.0;
export const ARCH_MAX_HEIGHT = 45;
export const ARCH_SEGMENTS = 30;
export const ARCH_RING_SPACING = 2.0;
```

Add validation lines after the existing validation block:

```typescript
if (LEG_TRUSS_WIDTH_BASE <= 0) throw new Error('LEG_TRUSS_WIDTH_BASE must be positive');
if (LEG_TRUSS_WIDTH_TOP <= 0) throw new Error('LEG_TRUSS_WIDTH_TOP must be positive');
if (LEG_TRUSS_WIDTH_TOP >= LEG_TRUSS_WIDTH_BASE) throw new Error('LEG_TRUSS_WIDTH_TOP must be less than LEG_TRUSS_WIDTH_BASE');
if (LEG_TRUSS_BAY_HEIGHT <= 0) throw new Error('LEG_TRUSS_BAY_HEIGHT must be positive');
if (LEG_SECTION_HEIGHT <= 0) throw new Error('LEG_SECTION_HEIGHT must be positive');
if (BODY_BAY_HEIGHT <= 0) throw new Error('BODY_BAY_HEIGHT must be positive');
if (ARCH_MAX_HEIGHT <= 0) throw new Error('ARCH_MAX_HEIGHT must be positive');
if (ARCH_MAX_HEIGHT >= LEG_SECTION_HEIGHT) throw new Error('ARCH_MAX_HEIGHT must be less than LEG_SECTION_HEIGHT');
if (ARCH_SEGMENTS < 4) throw new Error('ARCH_SEGMENTS must be at least 4');
if (ARCH_RING_SPACING <= 0) throw new Error('ARCH_RING_SPACING must be positive');
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS — all existing tests plus 8 new constants tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/constants.ts tests/constants.test.ts
git commit -m "feat: add engineering-model constants for leg trusses and arch panels"
```
