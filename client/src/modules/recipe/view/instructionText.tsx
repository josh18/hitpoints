import { RecipeInstructionContent } from '@hitpoints/shared';

interface InstructionTextProps {
    content: RecipeInstructionContent;
}

export function InstructionText({ content }: InstructionTextProps) {
    let result = <>{content.text}</>;
    if (content.italic) {
        result = <em>{result}</em>;
    }

    if (content.bold) {
        result = <strong>{result}</strong>;
    }

    return result;
}
