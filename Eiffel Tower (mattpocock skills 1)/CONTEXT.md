# Eiffel Tower (Superpower 3)

A structurally-accurate 3D model of the Eiffel Tower, built in Three.js at engineering-level fidelity, rendered with PBR materials and situated in a simplified Parisian ground plane.

## Language

### Tower Structure

**Tower**:
The full assembly from ground to antenna tip — all geometry groups combined and scaled by `SCENE_SCALE`.
_Avoid_: Model, scene

**Leg Truss**:
One of four independent square lattice trusses rising from 0m to 57m. Each leg has 4 chord tubes with X-bracing on all faces. The four legs diverge outward following the tower's exponential profile.
_Avoid_: Leg, pillar, column

**Body Lattice**:
The merged lattice structure from 57m to 300m, connecting the space between all four corner chords. Uses three-tier density decay (dense → medium → sparse with height).
_Avoid_: Upper lattice, merged section

**Chord**:
A main longitudinal structural member following the tower's exponential profile curve. Chords define the corners of each truss cross-section.
_Avoid_: Column, beam, main member

**Strut**:
A horizontal structural member connecting adjacent chords within a single ring plane.
_Avoid_: Tie, horizontal beam, crossbeam

**Brace**:
A diagonal structural member forming X-bracing or K-bracing within a truss panel.
_Avoid_: Diagonal, cross-member

**Bay**:
One repeating vertical module of a truss, bounded by two consecutive horizontal ring planes. All bracing patterns are defined per-bay.
_Avoid_: Panel, segment, cell

**Profile**:
The mathematical exponential-decay function `profile(h)` that returns the tower's half-width at any height `h`. Calibrated to three real-world anchor points: 62.5m at 0m, 32.5m at 57m, 9m at 276m.
_Avoid_: Silhouette, outline, curvature

### Vertical Zones

**Platform**:
One of three viewing-deck levels at 57m, 115m, and 276m. Each consists of a structural deck with cross-girders, railing, and posts.
_Avoid_: Deck, level, floor

**Pavilion**:
A restaurant enclosure sitting on a platform deck. The 1st platform (57m) holds the 58 Tour Eiffel pavilion; the 2nd platform (115m) holds the Jules Verne pavilion.
_Avoid_: Restaurant, building

**Cabin**:
The summit enclosure at the 3rd platform level (276m), housing mechanical equipment and the uppermost observation space.
_Avoid_: Top room, summit box

**Antenna**:
The tapered mast extending from the cabin roof (300m) to the tower tip (330m). Not part of the iron structure proper.
_Avoid_: Mast, spire

### Ground Level

**Pier**:
A masonry truncated pyramid under each leg, ~26m tall, housing the leg foundation and elevator machinery. Four piers total, connected by the esplanade.
_Avoid_: Foundation, footing, base block

**Esplanade**:
The raised paved surface connecting the four piers, forming the ground-level plaza beneath the tower.
_Avoid_: Plaza, ground platform, courtyard

**Arch Panel**:
A decorative curved opening between adjacent legs from 0m to 57m, formed by parallel arch tubes with vertical posts and cross-bracing.
_Avoid_: Archway, portal

### Systems

**Elevator Shaft**:
A slanted box-truss structure running up the inner face of the east and west legs from ground to the 2nd platform (115m), with an intermediate stop at the 1st platform (57m). Represents the Otis/Fives-Lille inclined elevator.
_Avoid_: Lift, cable car track

**Cross-girder**:
A Warren-truss beam forming the structural underside of each platform deck, arranged in a bidirectional grid. Depth scales by platform height.
_Avoid_: Deck beam, support beam

**Staircase**:
The interior double-helix spiral running from the 2nd platform (115m) to the 3rd platform (276m), represented as visible helix tubes hugging the inner tower face.
_Avoid_: Spiral stairs, interior stairs

**Gusset**:
A flat iron plate at each chord-brace intersection that connects the members. Represented in a procedural normal map rather than geometry, except at ground-level (0–20m) where InstancedMesh rivet detail is visible.
_Avoid_: Joint plate, connector plate, junction

### Materials & Rendering

**Paint Gradient**:
The three-tone graduated brown iron paint transitioning from dark brown (base) to medium brown (mid) to light brown (summit). Implemented as vertex colors computed from per-vertex height.
_Avoid_: Color zones, material tiers

**PBR**:
Physically-Based Rendering using `MeshStandardMaterial` with procedurally-generated tileable texture maps (albedo, roughness, metalness, normal). Replaces the former custom GLSL `ShaderMaterial`.
_Avoid_: Shader, custom material

**Ground Plane**:
The simplified terrain surrounding the tower, comprising three elevation blocks: the Seine river at the lowest level, Champ de Mars at mid-level, and Trocadero at the highest level, with sloped connectors.
_Avoid_: Terrain, landscape, environment ground
