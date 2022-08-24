
export type Row = string;
export type Shape = Row[];


const SYMBOLS = {
    LEFT_TOP: "┌",
    RIGHT_TOP: "┐",
    LEFT_BOTTOM: "└",
    RIGHT_BOTTOM: "┘",
    HORIZONTAL: "─",
    VERTICAL: "│"
}

// TODO: Add better validations and edge case handling
export function rectangle(width: number, height: number): Shape {
    const shape = [];
    // Top
    shape.push(
        SYMBOLS.LEFT_TOP + 
        (width - 2 > 0 ? SYMBOLS.HORIZONTAL.repeat(width - 2) : "") +
        SYMBOLS.RIGHT_TOP
    )
    // Mids
    if (height - 2 > 0) {
        for(let i = height - 2; i > 0; i--) {
            shape.push(
                SYMBOLS.VERTICAL + 
                (width - 2 > 0 ? " ".repeat(width - 2) : "") +
                SYMBOLS.VERTICAL
            )
        }
    }
    // Bottom
    shape.push(
        SYMBOLS.LEFT_BOTTOM + 
        (width - 2 > 0 ? SYMBOLS.HORIZONTAL.repeat(width - 2) : "") +
        SYMBOLS.RIGHT_BOTTOM
    )
    return shape
}