/**
 * Works around a Prismic editor bug: labeling `XVII` as `small-caps` and then
 * `e` as `ordinal-nums` saves a single label over all of `XVIIe`, and the
 * second label is lost. When a label's whole text is a Roman numeral followed
 * by a French ordinal suffix, this returns the two spans the editor meant to
 * save. Otherwise it returns nothing, so the label falls through to Prismic's
 * default `<span class="{label}">`.
 *
 * Correctly saved labels never match (`XVII` has no suffix, `e` no numeral),
 * so this can be removed once Prismic fixes the bug.
 */
const ROMAN_ORDINAL =
    /^([IVXLCDM]+)(e|er|re|ers|res|es|nd|nde|nds|ndes|ème|èmes)$/u

export default function splitRomanOrdinal(text: string): string | undefined {
    const match = ROMAN_ORDINAL.exec(text)

    if (!match) {
        return
    }

    const [, numeral, suffix] = match

    return `<span class="small-caps">${numeral}</span><span class="ordinal-nums">${suffix}</span>`
}
