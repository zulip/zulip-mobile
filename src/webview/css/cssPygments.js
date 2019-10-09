/* @flow strict-local */

/**
 * This entire code has been copied near verbatim from the WebApp's `pygments.scss` file.
 * https://github.com/zulip/zulip/blob/master/static/styles/pygments.scss.
 * The main change is in the logic of the `isNightMode` flag. The reason why we have to do
 * that is because the WebApp uses SCSS, which can detect this natively, while we use CSS.
 *
 * Use this command to get the diff between the WebApp code vs this file for debugging:
 * `git diff --no-index ../zulip/static/styles/pygments.scss src/webview/css/cssPygments.js`
 */

export default (isNightMode: boolean): string => `
.codehilite pre {
    background-color: hsl(0, 0%, 100%);
    -webkit-font-smoothing: auto;
}
.codehilite .hll {
    background-color: hsl(60, 100%, 90%);
}
.codehilite .c {
    color: hsl(180, 33%, 37%);
    font-style: italic;
} /* Comment */
.codehilite .err {
    border: 1px solid hsl(0, 100%, 50%);
} /* Error */
.codehilite .k {
    color: hsl(332, 70%, 38%);
} /* Keyword */
.codehilite .o {
    color: hsl(332, 70%, 38%);
} /* Operator */
.codehilite .cm {
    color: hsl(180, 33%, 37%);
    font-style: italic;
} /* Comment.Multiline */
.codehilite .cp {
    color: hsl(38, 100%, 36%);
} /* Comment.Preproc */
.codehilite .c1 {
    color: hsl(0, 0%, 67%);
    font-style: italic;
} /* Comment.Single */
.codehilite .cs {
    color: hsl(180, 33%, 37%);
    font-style: italic;
} /* Comment.Special */
.codehilite .gd {
    color: hsl(0, 100%, 31%);
} /* Generic.Deleted */
.codehilite .ge {
    font-style: italic;
} /* Generic.Emph */
.codehilite .gr {
    color: hsl(0, 100%, 50%);
} /* Generic.Error */
.codehilite .gh {
    color: hsl(240, 100%, 25%);
    font-weight: bold;
} /* Generic.Heading */
.codehilite .gi {
    color: hsl(120, 100%, 31%);
} /* Generic.Inserted */
.codehilite .go {
    color: hsl(0, 0%, 50%);
} /* Generic.Output */
.codehilite .gp {
    color: hsl(240, 100%, 25%);
    font-weight: bold;
} /* Generic.Prompt */
.codehilite .gs {
    font-weight: bold;
} /* Generic.Strong */
.codehilite .gu {
    color: hsl(300, 100%, 25%);
    font-weight: bold;
} /* Generic.Subheading */
.codehilite .gt {
    color: hsl(221, 100%, 40%);
} /* Generic.Traceback */
.codehilite .kc {
    color: hsl(332, 70%, 38%);
    font-weight: bold;
} /* Keyword.Constant */
.codehilite .kd {
    color: hsl(332, 70%, 38%);
} /* Keyword.Declaration */
.codehilite .kn {
    color: hsl(332, 70%, 38%);
    font-weight: bold;
} /* Keyword.Namespace */
.codehilite .kp {
    color: hsl(332, 70%, 38%);
} /* Keyword.Pseudo */
.codehilite .kr {
    color: hsl(332, 70%, 38%);
    font-weight: bold;
} /* Keyword.Reserved */
.codehilite .kt {
    color: hsl(332, 70%, 38%);
} /* Keyword.Type */
.codehilite .m {
    color: hsl(0, 0%, 40%);
} /* Literal.Number */
.codehilite .s {
    color: hsl(86, 57%, 40%);
} /* Literal.String */
.codehilite .na {
    color: hsl(71, 55%, 36%);
} /* Name.Attribute */
.codehilite .nb {
    color: hsl(195, 100%, 35%);
} /* Name.Builtin */
.codehilite .nc {
    color: hsl(264, 27%, 50%);
    font-weight: bold;
} /* Name.Class */
.codehilite .no {
    color: hsl(0, 100%, 26%);
} /* Name.Constant */
.codehilite .nd {
    color: hsl(276, 100%, 56%);
} /* Name.Decorator */
.codehilite .ni {
    color: hsl(0, 0%, 60%);
    font-weight: bold;
} /* Name.Entity */
.codehilite .ne {
    color: hsl(2, 62%, 52%);
    font-weight: bold;
} /* Name.Exception */
.codehilite .nf {
    color: hsl(264, 27%, 50%);
} /* Name.Function */
.codehilite .nl {
    color: hsl(60, 100%, 31%);
} /* Name.Label */
.codehilite .nn {
    color: hsl(264, 27%, 50%);
    font-weight: bold;
} /* Name.Namespace */
.codehilite .nt {
    color: hsl(120, 100%, 25%);
    font-weight: bold;
} /* Name.Tag */
.codehilite .nv {
    color: hsl(241, 68%, 28%);
} /* Name.Variable */
.codehilite .nx {
    color: hsl(0, 0%, 26%);
} /* Not sure? */
.codehilite .ow {
    color: hsl(276, 100%, 56%);
    font-weight: bold;
} /* Operator.Word */
.codehilite .w {
    color: hsl(0, 0%, 73%);
} /* Text.Whitespace */
.codehilite .mf {
    color: hsl(195, 100%, 35%);
} /* Literal.Number.Float */
.codehilite .mh {
    color: hsl(195, 100%, 35%);
} /* Literal.Number.Hex */
.codehilite .mi {
    color: hsl(195, 100%, 35%);
} /* Literal.Number.Integer */
.codehilite .mo {
    color: hsl(195, 100%, 35%);
} /* Literal.Number.Oct */
.codehilite .sb {
    color: hsl(86, 57%, 40%);
} /* Literal.String.Backtick */
.codehilite .sc {
    color: hsl(86, 57%, 40%);
} /* Literal.String.Char */
.codehilite .sd {
    color: hsl(86, 57%, 40%);
    font-style: italic;
} /* Literal.String.Doc */
.codehilite .s2 {
    color: hsl(225, 71%, 33%);
} /* Literal.String.Double */
.codehilite .se {
    color: hsl(26, 69%, 43%);
    font-weight: bold;
} /* Literal.String.Escape */
.codehilite .sh {
    color: hsl(86, 57%, 40%);
} /* Literal.String.Heredoc */
.codehilite .si {
    color: hsl(336, 38%, 56%);
    font-weight: bold;
} /* Literal.String.Interpol */
.codehilite .sx {
    color: hsl(120, 100%, 25%);
} /* Literal.String.Other */
.codehilite .sr {
    color: hsl(189, 54%, 49%);
} /* Literal.String.Regex */
.codehilite .s1 {
    color: hsl(86, 57%, 40%);
} /* Literal.String.Single */
.codehilite .ss {
    color: hsl(241, 68%, 28%);
} /* Literal.String.Symbol */
.codehilite .bp {
    color: hsl(120, 100%, 25%);
} /* Name.Builtin.Pseudo */
.codehilite .vc {
    color: hsl(241, 68%, 28%);
} /* Name.Variable.Class */
.codehilite .vg {
    color: hsl(241, 68%, 28%);
} /* Name.Variable.Global */
.codehilite .vi {
    color: hsl(241, 68%, 28%);
} /* Name.Variable.Instance */
.codehilite .il {
    color: hsl(0, 0%, 40%);
} /* Literal.Number.Integer.Long */


/* Syntax Highlighting for night-mode */
${
  isNightMode
    ? `
    .codehilite code,
    .codehilite pre {
        color: hsl(212, 100%, 82%);
        background-color: hsl(212, 25%, 15%);
    }

    .codehilite .hll {
        background-color: hsl(0, 0%, 13%);
    }

    .codehilite .err {
        color: hsl(1, 67%, 66%);
        background-color: hsl(0, 7%, 22%);
    }

    .codehilite .k {
        color: hsl(31, 85%, 59%);
    }

    .codehilite .p {
        color: hsl(179, 27%, 35%);
    }

    .codehilite .cs {
        color: hsl(0, 100%, 40%);
        font-weight: 700;
    }

    .codehilite .gd {
        color: hsl(0, 100%, 40%);
    }

    .codehilite .ge {
        color: hsl(0, 0%, 80%);
        font-style: italic;
    }

    .codehilite .gr {
        color: hsl(0, 100%, 50%);
    }

    .codehilite .go {
        color: hsl(0, 0%, 50%);
    }

    .codehilite .gs {
        color: hsl(0, 0%, 80%);
        font-weight: 700;
    }

    .codehilite .gu {
        color: hsl(300, 100%, 25%);
        font-weight: 700;
    }

    .codehilite .gt {
        color: hsl(222, 100%, 41%);
    }

    .codehilite .kc {
        color: hsl(0, 45%, 75%);
    }

    .codehilite .kd {
        color: hsl(60, 100%, 76%);
    }

    .codehilite .kn {
        color: hsl(24, 56%, 72%);
        font-weight: 700;
    }

    .codehilite .kp {
        color: hsl(62, 36%, 71%);
    }

    .codehilite .kr {
        color: hsl(359, 58%, 56%);
    }

    .codehilite .ni {
        color: hsl(359, 35%, 63%);
    }

    .codehilite .ne {
        color: hsl(53, 23%, 69%);
        font-weight: 700;
    }

    .codehilite .nn {
        color: hsl(204, 54%, 72%);
    }

    .codehilite .vi {
        color: hsl(60, 100%, 89%);
    }

    .codehilite .c,
    .codehilite .g,
    .codehilite .cm,
    .codehilite .cp,
    .codehilite .c1 {
        color: hsl(209, 15%, 55%);
    }

    .codehilite .l,
    .codehilite .x,
    .codehilite .no,
    .codehilite .nd,
    .codehilite .nl,
    .codehilite .nx,
    .codehilite .py,
    .codehilite .w {
        color: hsl(0, 0%, 80%);
    }

    .codehilite .n,
    .codehilite .nv,
    .codehilite .vg {
        color: hsl(60, 19%, 83%);
    }

    .codehilite .o,
    .codehilite .ow {
        color: hsl(58, 52%, 88%);
    }

    .codehilite .gh,
    .codehilite .gp {
        color: hsl(60, 19%, 83%);
        font-weight: 700;
    }

    .codehilite .gi,
    .codehilite .kt {
        color: hsl(120, 100%, 40%);
    }

    .codehilite .ld,
    .codehilite .s,
    .codehilite .sb,
    .codehilite .sc,
    .codehilite .sd,
    .codehilite .s2,
    .codehilite .se,
    .codehilite .sh,
    .codehilite .si,
    .codehilite .sx,
    .codehilite .sr,
    .codehilite .s1,
    .codehilite .ss {
        color: hsl(0, 36%, 69%);
    }

    .codehilite .m,
    .codehilite .mf,
    .codehilite .mh,
    .codehilite .mi,
    .codehilite .mo,
    .codehilite .il {
        color: hsl(183, 45%, 69%);
    }

    .codehilite .na,
    .codehilite .nt {
        color: hsl(127, 25%, 68%);
    }

    .codehilite .nb,
    .codehilite .nc,
    .codehilite .nf,
    .codehilite .bp,
    .codehilite .vc {
        color: hsl(60, 75%, 75%);
    }
`
    : ''
}
`;
