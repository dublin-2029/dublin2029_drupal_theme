# Group address fields into a fieldset on the registration form

**Project:** ConReg - Convention Registration (`drupal/conreg`)
**Version:** 1.0.0-beta2
**Type:** Feature request
**Component:** Registration form

## Summary

On the registration form, each member's postal address fields (street,
street 2, city, county, postcode, country) and the "Same as member 1"
checkbox are rendered as a flat list of form elements alongside the rest of
the member's details. There's no visual grouping or heading, so the address
fields and the "same as" checkbox look disconnected from each other and from
the rest of the form.

## Problem description

The address fields for each member are built as individual, unwrapped form
elements in `Registration::buildForm()`
(`src/Form/Registration.php`, ~line 577 onward). The "Same as member 1"
checkbox (`same_address`) is added as a sibling element immediately before
the address fields, rather than as part of the same visual group. As a
result:

- There is no heading or container identifying the address block as a
  distinct section of the form.
- The "Same as member 1" checkbox appears to float on its own above the
  address fields it controls, rather than being visually tied to them.
- When the checkbox is ticked and the address fields are hidden (for
  member 2+), the checkbox is left sitting in an otherwise empty area,
  making the form look unbalanced.
- Sites theming the registration form have no single element to target for
  the address block as a whole, and no built-in way to give it a heading,
  without re-implementing the field build themselves.

## Proposed solution

Wrap the address fields (`street`, `street2`, `city`, `county`, `postcode`,
`country`) together with the "Same as member 1" checkbox in a `fieldset`
(or `details`) render element with an "Address" title/legend, so they read
as one coherent group on the form by default.

Suggested approach:

1. In `Registration::buildForm()`, introduce a wrapping element (e.g.
   `$form['members']['member' . $cnt]['address_group']`) of
   `#type => 'fieldset'` with `#title => $this->t('Address')`, and move
   `same_address` and `address` inside it.
2. Keep the existing `#memberAddress{cnt}` prefix/suffix wrapper (used by
   `updateMemberAddressCallback`'s AJAX replacement) working correctly
   inside the new fieldset — either keep it on the inner `address` element
   as now, or move it to the fieldset itself and update the callback to
   match, whichever keeps the AJAX partial replacement scoped correctly.
3. Make the fieldset title configurable/translatable, consistent with how
   other field labels on this form are already driven by member class
   configuration (e.g. `$curMemberClass->fields->same_address`), so sites
   can rename or disable the heading if desired.
4. Add/adjust default CSS in the module (or confirm existing theme CSS still
   applies cleanly) so the fieldset border/legend styling doesn't clash with
   sites' existing registration form theming.
