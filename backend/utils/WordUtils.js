const { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, AlignmentType, BorderStyle, VerticalAlign } = require('docx');
const fs = require('fs');

exports.parseWordFile = (text) => {
    const questions = text.split('\n').filter(line => line.trim() !== '');
    const formattedQuestions = [];

    let currentQuestion = null;

    for (let i = 0; i < questions.length; i++) {
        // Remove numerical prefixes from questions (e.g., "1. ", "2. ")
        let questionLine = questions[i].replace(/^\s*\d+\.\s*/, '');
        if (questionLine.includes('?')) {
            if (currentQuestion) {
                formattedQuestions.push(currentQuestion);
            }
            currentQuestion = { question: questionLine, options: [] };
        } else if (currentQuestion) {
            // Remove any character prefixes enclosed in parentheses (e.g., "(a)", "(b)")
            let optionLine = questions[i].replace(/^\s*\([a-zA-Z0-9]\)\s*/, '');
            currentQuestion.options.push(optionLine);
        }
    }

      if (currentQuestion) {
        formattedQuestions.push(currentQuestion);
    }

    // Remove prefixes from each question and options array before returning
     return formattedQuestions.map(item => {
        item.question = item.question.replace(/^\d+\.\s*/, ''); // Remove question number prefix
        item.options = item.options.map(option => option.replace(/([a-z])/, '')); // Remove option prefix
        return item;
    });
};


exports.generateTableWordFile = async (data, outputPath) => {
  
    const doc = new Document({
        sections: [{
            properties: {},
            children: [
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    borders: {
                        top: { style: BorderStyle.SINGLE, size: 1 },
                        bottom: { style: BorderStyle.SINGLE, size: 1 },
                        left: { style: BorderStyle.SINGLE, size: 1 },
                        right: { style: BorderStyle.SINGLE, size: 1 },
                        insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
                        insideVertical: { style: BorderStyle.SINGLE, size: 1 },
                    },
                    rows: data.flatMap((item, index) => {
                        return [
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
                            ...item.options.map((option, optionIndex) => {
                                const parts = option.split('\t');
                                const optionText = parts[0] || "";
                                const correctness = parts[1] || "";
                                return new TableRow({
                                    children: [
                                        new TableCell({
                                            children: [new Paragraph({ text: `Option`, alignment: AlignmentType.CENTER })],
                                            width: { size: 20, type: WidthType.PERCENTAGE },
                                            verticalAlign: VerticalAlign.CENTER,
                                        }),
                                        new TableCell({
                                            children: [new Paragraph(optionText)],
                                            width: { size: 60, type: WidthType.PERCENTAGE },
                                        }),
                                        new TableCell({
                                            children: [new Paragraph({ text: 'Incorrect', alignment: AlignmentType.CENTER })],
                                            width: { size: 20, type: WidthType.PERCENTAGE },
                                            verticalAlign: VerticalAlign.CENTER,
                                        }),
                                    ],
                                });
                            }),
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
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [new Paragraph({ text: 'Marks', alignment: AlignmentType.CENTER })],
                                        width: { size: 20, type: WidthType.PERCENTAGE },
                                        verticalAlign: VerticalAlign.CENTER,
                                    }),
                                    new TableCell({
                                        children: [new Paragraph(item.marks || "")],
                                        width: { size: 80, type: WidthType.PERCENTAGE },
                                        columnSpan: 2,
                                    }),
                                ],
                            }),
                        ];
                    }),
                }),
            ],
        }],
    });

    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(outputPath, buffer);
};
