const { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, AlignmentType, BorderStyle, VerticalAlign } = require('docx');
const fs = require('fs');
exports.parseWordFile = (text) => {
    const lines = text.split('\n');
    const formattedQuestions = [];
    let currentQuestion = null;
    let currentOption = null;
    let optionStarted = false;
console.log(lines)
    const addCurrentOption = () => {
        console.log(currentOption)
        if (currentOption !== null && currentOption.trim()) {
            currentQuestion.options.push(currentOption.trim());
            currentOption = null;
        }
    };

    lines.forEach((line) => {
        line = line.trim();
        if (!line) return; // Skip empty lines

        let i = 0;
        while (i < line.length) {
            // Check if the line starts with a number followed by a period (e.g., "1. ", "2. ")
            if (/\d+\.\s*/.test(line.slice(i))) {
                const match = line.slice(i).match(/^\d+\.\s*/);
                if (match) {
                    // If there's an ongoing question, push it to the formattedQuestions array
                    if (currentQuestion) {
                        addCurrentOption();
                        formattedQuestions.push(currentQuestion);
                    }
                    // Initialize a new question object
                    currentQuestion = { question: '', options: [] };
                    currentOption = null;
                    optionStarted = false;
                    i += match[0].length;
                    continue;
                }
            }

            // Check if the line starts with an option prefix (e.g., "(a)", "(b)", "(c)", "(d)")
            if (/\([a-d]\)\s*/.test(line.slice(i))) {
                const match = line.slice(i).match(/^\([a-d]\)\s*/);
                if (match) {
                    if (optionStarted) {
                        addCurrentOption();
                    } else {
                        optionStarted = true;
                    }
                    currentOption = '';
                    i += match[0].length;
                    continue;
                }
            }

            // Append characters to the current option or question
            if (optionStarted && currentOption !== null) {
                currentOption += line[i];
            } else if (currentQuestion) {
                currentQuestion.question += line[i];
            }

            i++;
        }

        // Handle the end of the line
        // if (currentOption !== null && currentOption.trim()) {
        //     currentOption = currentOption.trim();
        //     if (currentQuestion && currentQuestion.options.length < 4) {
        //         currentQuestion.options.push(currentOption);
        //     }
        // }
    });

    // Push the last question into the formattedQuestions array
    if (currentQuestion) {
        addCurrentOption();
        formattedQuestions.push(currentQuestion);
    }

  


    console.log(formattedQuestions, "formatted qyestions")
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
