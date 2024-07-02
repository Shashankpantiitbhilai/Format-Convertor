const { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, AlignmentType, BorderStyle, VerticalAlign } = require('docx');
const fs = require('fs');
exports.parseWordFile = (text) => {
    const lines = text.split('\n');
    const formattedQuestions = [];
    let currentQuestion = null;
    let currentOption = null;
    let questionText = '';

    const addCurrentOption = () => {
        if (currentOption !== null && currentOption.trim()) {
            currentQuestion.options.push(currentOption.trim());
            currentOption = null;
        }
    };

    const startNewQuestion = () => {
        if (currentQuestion) {
            addCurrentOption();
            formattedQuestions.push(currentQuestion);
        }
        currentQuestion = { question: '', options: [] };
        questionText = '';
    };

    const removeNumberPrefix = (text) => {
        return text.replace(/^\d+\.\s*/, '').trim();
    };

    lines.forEach((line) => {
        line = line.trim();
        if (!line) return; // Skip empty lines

        let i = 0;
        while (i < line.length) {
            // Check for new question number
            if (/^\d+\./.test(line.slice(i))) {
                startNewQuestion();
                questionText += line.slice(i);
                break; // Move to next line
            }

            // Check if the line starts with an option prefix (e.g., "(a)", "(b)", "(c)", "(d)")
            if (/^\([a-d]\)/.test(line.slice(i))) {
                if (!currentQuestion) {
                    startNewQuestion();
                }
                if (questionText.trim() && currentQuestion.question === '') {
                    currentQuestion.question = removeNumberPrefix(questionText.trim());
                    questionText = '';
                }
                addCurrentOption();
                currentOption = '';
                i += 3; // Skip the option marker
                continue;
            }

            // If no option prefix detected, append characters to question text or current option
            if (currentOption !== null) {
                currentOption += line[i];
            } else {
                questionText += line[i];
            }

            i++;
        }
    });

    // Handle any remaining content
    if (currentQuestion) {
        if (questionText.trim()) {
            currentQuestion.question += ' ' + removeNumberPrefix(questionText.trim());
        }
        addCurrentOption();
        formattedQuestions.push(currentQuestion);
    }

    // console.log(formattedQuestions);
    return formattedQuestions;
};
exports.generateTableWordFile = async (data, outputPath) => {

    const doc = new Document({
        sections: [{
            properties: {},
            children: data.flatMap((item, index) => {
                const table = new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    borders: {
                        top: { style: BorderStyle.SINGLE, size: 1 },
                        bottom: { style: BorderStyle.SINGLE, size: 1 },
                        left: { style: BorderStyle.SINGLE, size: 1 },
                        right: { style: BorderStyle.SINGLE, size: 1 },
                        insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
                        insideVertical: { style: BorderStyle.SINGLE, size: 1 },
                    },
                    rows: [
                        // Question row
                        new TableRow({
                            children: [
                                new TableCell({
                                    children: [new Paragraph({ text: 'Question', alignment: AlignmentType.CENTER })],
                                    width: { size: 20, type: WidthType.PERCENTAGE },
                                    verticalAlign: VerticalAlign.CENTER,
                                }),
                                new TableCell({
                                    children: [new Paragraph(`${item.question}`)],
                                    width: { size: 80, type: WidthType.PERCENTAGE },
                                    columnSpan: 2,
                                }),
                            ],
                        }),
                        // Type row
                        new TableRow({
                            children: [
                                new TableCell({
                                    children: [new Paragraph({ text: 'Type', alignment: AlignmentType.CENTER })],
                                    width: { size: 20, type: WidthType.PERCENTAGE },
                                    verticalAlign: VerticalAlign.CENTER,
                                }),
                                new TableCell({
                                    children: [new Paragraph('multiple_choice')],
                                    width: { size: 80, type: WidthType.PERCENTAGE },
                                    columnSpan: 2,
                                }),
                            ],
                        }),
                        // Options rows
                        ...item.options.map((option, optionIndex) => {
                            const isCorrect = optionIndex === 0; // First option is correct

                            return new TableRow({
                                children: [
                                    new TableCell({
                                        children: [new Paragraph({ text: `Option`, alignment: AlignmentType.CENTER })],
                                        width: { size: 20, type: WidthType.PERCENTAGE },
                                        verticalAlign: VerticalAlign.CENTER,
                                    }),
                                    new TableCell({
                                        children: [new Paragraph(option)],
                                        width: { size: 60, type: WidthType.PERCENTAGE },
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ text: isCorrect ? 'correct' : 'incorrect', alignment: AlignmentType.CENTER })],
                                        width: { size: 20, type: WidthType.PERCENTAGE },
                                        verticalAlign: VerticalAlign.CENTER,
                                    }),
                                ],
                            });
                        }),
                        // Solution row
                        new TableRow({
                            children: [
                                new TableCell({
                                    children: [new Paragraph({ text: 'Solution', alignment: AlignmentType.CENTER })],
                                    width: { size: 20, type: WidthType.PERCENTAGE },
                                    verticalAlign: VerticalAlign.CENTER,
                                }),
                                new TableCell({
                                    children: [new Paragraph(item.solution || "")],
                                    width: { size: 80, type: WidthType.PERCENTAGE },
                                    columnSpan: 2,
                                }),
                            ],
                        }),
                        // Marks row
                        new TableRow({
                            children: [
                                new TableCell({
                                    children: [new Paragraph({ text: 'Marks', alignment: AlignmentType.CENTER })],
                                    width: { size: 20, type: WidthType.PERCENTAGE },
                                    verticalAlign: VerticalAlign.CENTER,
                                }),
                                new TableCell({
                                    children: [new Paragraph(item.marks || "1")],
                                    width: { size: 60, type: WidthType.PERCENTAGE },
                                }),
                                new TableCell({
                                    children: [new Paragraph(item.marks || "0.25")],
                                    width: { size: 20, type: WidthType.PERCENTAGE },
                                    verticalAlign: VerticalAlign.CENTER,
                                }),
                            ],
                        }),
                    ],
                });

                // Add a blank paragraph after each table (except the last one)
                if (index < data.length - 1) {
                    return [table, new Paragraph({ text: '', spacing: { after: 200 } })];
                }
                return [table];
            }),
        }],
    });

    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(outputPath, buffer);
};
