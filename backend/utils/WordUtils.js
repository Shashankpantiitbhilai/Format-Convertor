const { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, AlignmentType, BorderStyle, VerticalAlign } = require('docx');
const fs = require('fs');
exports.parseWordFile = (text) => {
    const lines = text.split('\n'); // Split the input text into lines.
    const formattedQuestions = []; // Array to hold the formatted questions.
    let currentQuestion = null; // Variable to hold the current question being processed.
    let currentOption = null; // Variable to hold the current option being processed.
    let questionText = ''; // Variable to accumulate question text.

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

        if (/^\d+\.\s/.test(line)) { // New question detected
            if (currentQuestion && currentQuestion.options.length === 0) { // No options detected yet
                questionText += ' ' + line;
            } else {
                startNewQuestion();
                questionText += line;
            }
        } else if (/^\([a-d]\)/.test(line)) { // New option detected
            if (!currentQuestion) {
                startNewQuestion();
            }
            if (questionText.trim() && currentQuestion.question === '') {
                currentQuestion.question = removeNumberPrefix(questionText.trim());
                questionText = '';
            }
            addCurrentOption();
            currentOption = line.slice(3).trim(); // Start new option
        } else { // Continue current question or option
            if (currentOption !== null) {
                currentOption += ' ' + line;
            } else {
                questionText += ' ' + line;
            }
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
