import assert = require('assert');
import { BufferDeleteCommand } from '../../src/cmd_line/commands/bufferDelete';
import { CloseCommand } from '../../src/cmd_line/commands/close';
import { CopyCommand } from '../../src/cmd_line/commands/copy';
import { DeleteRangeCommand } from '../../src/cmd_line/commands/deleteRange';
import { DigraphsCommand } from '../../src/cmd_line/commands/digraph';
import { FileCommand } from '../../src/cmd_line/commands/file';
import { GotoCommand } from '../../src/cmd_line/commands/goto';
import { GotoLineCommand } from '../../src/cmd_line/commands/gotoLine';
import { HistoryCommand, HistoryCommandType } from '../../src/cmd_line/commands/history';
import { LeftCommand, RightCommand } from '../../src/cmd_line/commands/leftRight';
import { DeleteMarksCommand, MarksCommand } from '../../src/cmd_line/commands/marks';
import { PutExCommand } from '../../src/cmd_line/commands/put';
import { QuitCommand } from '../../src/cmd_line/commands/quit';
import { ReadCommand } from '../../src/cmd_line/commands/read';
import { RegisterCommand } from '../../src/cmd_line/commands/register';
import { SetOptionsCommand } from '../../src/cmd_line/commands/setoptions';
import { SortCommand } from '../../src/cmd_line/commands/sort';
import { SubstituteCommand } from '../../src/cmd_line/commands/substitute';
import { TabCommandType, TabCommand } from '../../src/cmd_line/commands/tab';
import { WriteCommand } from '../../src/cmd_line/commands/write';
import { YankCommand } from '../../src/cmd_line/commands/yank';
import { ExCommand } from '../../src/vimscript/exCommand';
import { exCommandParser } from '../../src/vimscript/exCommandParser';
import { Address } from '../../src/vimscript/lineRange';
import { Pattern, SearchDirection } from '../../src/vimscript/pattern';

function exParseTest(input: string, parsed: ExCommand) {
  test(input, () => {
    const { command } = exCommandParser.tryParse(input);
    assert.deepStrictEqual(command, parsed);
  });
}

function exParseFails(input: string) {
  test(input, () => {
    assert.throws(() => exCommandParser.tryParse(input));
  });
}

suite('Ex command parsing', () => {
  suite('Unknown command', () => {
    exParseFails(':fakecmd');
  });

  suite(':[range]', () => {
    exParseTest(':', new GotoLineCommand());
    exParseTest(':5', new GotoLineCommand());
    exParseTest(':%', new GotoLineCommand());
    exParseTest(':.+5', new GotoLineCommand());
    exParseTest(':.+,.+-+3', new GotoLineCommand());
  });

  suite(':!', () => {
    // TODO
  });

  suite(':bd[elete]', () => {
    exParseTest(':bd', new BufferDeleteCommand({ bang: false, buffers: [] }));
    exParseTest(':bd 2 5 3', new BufferDeleteCommand({ bang: false, buffers: [2, 5, 3] }));
    exParseTest(':bd abc.txt', new BufferDeleteCommand({ bang: false, buffers: ['abc.txt'] }));
    exParseTest(
      ':bd abc.txt 5 blah.cc',
      new BufferDeleteCommand({ bang: false, buffers: ['abc.txt', 5, 'blah.cc'] })
    );
    exParseTest(':bd!', new BufferDeleteCommand({ bang: true, buffers: [] }));
    exParseTest(':bd! 2 5 3', new BufferDeleteCommand({ bang: true, buffers: [2, 5, 3] }));
    exParseTest(':bd! abc.txt', new BufferDeleteCommand({ bang: true, buffers: ['abc.txt'] }));
    exParseTest(
      ':bd! abc.txt 5 blah.cc',
      new BufferDeleteCommand({ bang: true, buffers: ['abc.txt', 5, 'blah.cc'] })
    );
  });

  suite(':bn[ext]', () => {
    // TODO
  });

  suite(':clo[se]', () => {
    exParseTest(':clo', new CloseCommand(false));
    exParseTest(':clo!', new CloseCommand(true));
    exParseTest(':close', new CloseCommand(false));
    exParseTest(':close!', new CloseCommand(true));
  });

  suite(':co[py]', () => {
    exParseTest(':copy', new CopyCommand());
    exParseTest(':copy 0', new CopyCommand(new Address({ type: 'number', num: 0 })));
    exParseTest(':copy 1', new CopyCommand(new Address({ type: 'number', num: 1 })));
    exParseTest(':copy 56', new CopyCommand(new Address({ type: 'number', num: 56 })));
    exParseTest(':copy .', new CopyCommand(new Address({ type: 'current_line' })));
    exParseTest(':copy .+2', new CopyCommand(new Address({ type: 'current_line' }, 2)));
  });

  suite(':d[elete]', () => {
    exParseTest(':d', new DeleteRangeCommand({ register: undefined, count: undefined }));
    exParseTest(':d a', new DeleteRangeCommand({ register: 'a', count: undefined }));
    exParseTest(':d 5', new DeleteRangeCommand({ register: undefined, count: 5 }));
    exParseTest(':d a 5', new DeleteRangeCommand({ register: 'a', count: 5 }));
  });

  suite(':delm[arks]', () => {
    exParseTest(':delm!', new DeleteMarksCommand('!'));

    exParseTest(':delm a', new DeleteMarksCommand(['a']));
    exParseTest(':delm aA1 ^k', new DeleteMarksCommand(['a', 'A', '1', '^', 'k']));
    exParseTest(':delm a-z', new DeleteMarksCommand([{ start: 'a', end: 'z' }]));
    exParseTest(':delm A-Z', new DeleteMarksCommand([{ start: 'A', end: 'Z' }]));
    exParseTest(':delm 1-9', new DeleteMarksCommand([{ start: '1', end: '9' }]));
    exParseTest(':delm 24-9', new DeleteMarksCommand(['2', { start: '4', end: '9' }]));
    exParseTest(
      ':delm A-K2-4',
      new DeleteMarksCommand([
        { start: 'A', end: 'K' },
        { start: '2', end: '4' },
      ])
    );

    exParseFails(':delm'); // TODO: Should throw `E471: Argument required`

    exParseFails(':delm -'); // TODO: Should throw `E475: Invalid argument: -`
    exParseFails(':delm a-'); // TODO: Should throw `E475: Invalid argument: a-`
    exParseFails(':delm -z'); // TODO: Should throw `E475: Invalid argument: -z`
    exParseFails(':delm a-Z'); // TODO: Should throw `E475: Invalid argument: a-Z`

    exParseFails(':delm! a'); // TODO: Should throw `E475: Invalid argument`
  });

  suite(':dig[raphs]', () => {
    exParseTest(':dig', new DigraphsCommand({ bang: false, newDigraphs: [] }));
    exParseTest(':dig!', new DigraphsCommand({ bang: true, newDigraphs: [] }));
    exParseTest(
      ':dig e: 235',
      new DigraphsCommand({ bang: false, newDigraphs: [['e', ':', 235]] })
    );
    exParseTest(
      ':dig e: 235 a: 238',
      new DigraphsCommand({
        bang: false,
        newDigraphs: [
          ['e', ':', 235],
          ['a', ':', 238],
        ],
      })
    );

    exParseFails(':dig e:');
  });

  suite(':e[dit]', () => {
    exParseTest(
      ':edit',
      new FileCommand({ name: 'edit', bang: false, opt: [], cmd: undefined, file: undefined })
    );
    exParseTest(
      ':edit!',
      new FileCommand({ name: 'edit', bang: true, opt: [], cmd: undefined, file: undefined })
    );

    exParseTest(
      ':edit abc.txt',
      new FileCommand({ name: 'edit', bang: false, opt: [], cmd: undefined, file: 'abc.txt' })
    );
    exParseTest(
      ':edit! abc.txt',
      new FileCommand({ name: 'edit', bang: true, opt: [], cmd: undefined, file: 'abc.txt' })
    );

    // TODO: Test with [++opt]
    // TODO: Test with [+cmd]
    // TODO: Test with #[count]
  });

  suite(':ene[w]', () => {
    exParseTest(':enew', new FileCommand({ name: 'enew', bang: false }));
    exParseTest(':enew!', new FileCommand({ name: 'enew', bang: true }));
  });

  suite(':go[to]', () => {
    exParseTest(':goto', new GotoCommand());
    exParseTest(':goto 123', new GotoCommand(123));
  });

  suite(':his[tory]', () => {
    exParseTest(':his', new HistoryCommand({ type: HistoryCommandType.Cmd }));

    exParseTest(':his c', new HistoryCommand({ type: HistoryCommandType.Cmd }));
    exParseTest(':his cmd', new HistoryCommand({ type: HistoryCommandType.Cmd }));
    exParseTest(':his :', new HistoryCommand({ type: HistoryCommandType.Cmd }));

    exParseTest(':his s', new HistoryCommand({ type: HistoryCommandType.Search }));
    exParseTest(':his search', new HistoryCommand({ type: HistoryCommandType.Search }));
    exParseTest(':his /', new HistoryCommand({ type: HistoryCommandType.Search }));

    exParseTest(':his e', new HistoryCommand({ type: HistoryCommandType.Expr }));
    exParseTest(':his expr', new HistoryCommand({ type: HistoryCommandType.Expr }));
    exParseTest(':his =', new HistoryCommand({ type: HistoryCommandType.Expr }));

    exParseTest(':his i', new HistoryCommand({ type: HistoryCommandType.Input }));
    exParseTest(':his input', new HistoryCommand({ type: HistoryCommandType.Input }));
    exParseTest(':his @', new HistoryCommand({ type: HistoryCommandType.Input }));

    exParseTest(':his d', new HistoryCommand({ type: HistoryCommandType.Debug }));
    exParseTest(':his debug', new HistoryCommand({ type: HistoryCommandType.Debug }));
    exParseTest(':his >', new HistoryCommand({ type: HistoryCommandType.Debug }));

    exParseTest(':his a', new HistoryCommand({ type: HistoryCommandType.All }));
    exParseTest(':his all', new HistoryCommand({ type: HistoryCommandType.All }));

    // TODO parse indices
  });

  suite(':le[ft]', () => {
    exParseTest(':left', new LeftCommand({ indent: 0 }));
    exParseTest(':left4', new LeftCommand({ indent: 4 }));
    exParseTest(':left 8', new LeftCommand({ indent: 8 }));
  });

  suite(':let', () => {
    // TODO
  });

  suite(':marks', () => {
    exParseTest(':marks', new MarksCommand([]));
    exParseTest(':marks aB', new MarksCommand(['a', 'B']));
    exParseTest(':marks 0 1', new MarksCommand(['0', '1']));
  });

  suite(':p[rint]', () => {
    // TODO
  });

  suite(':pu[t]', () => {
    exParseTest(':put', new PutExCommand({ bang: false, register: undefined }));
    exParseTest(':put!', new PutExCommand({ bang: true, register: undefined }));
    exParseTest(':put x', new PutExCommand({ bang: false, register: 'x' }));
    exParseTest(':put! x', new PutExCommand({ bang: true, register: 'x' }));

    // No space, non-alpha register
    exParseTest(':put"', new PutExCommand({ bang: false, register: '"' }));
    exParseTest(':put!"', new PutExCommand({ bang: true, register: '"' }));

    // No space, alpha register
    exParseFails(':putx');
    exParseTest(':put!x', new PutExCommand({ bang: true, register: 'x' }));
  });

  suite(':q[uit] and :qa[ll]', () => {
    exParseTest(':q', new QuitCommand({ bang: false, quitAll: false }));
    exParseTest(':q!', new QuitCommand({ bang: true, quitAll: false }));
    exParseTest(':qa', new QuitCommand({ bang: false, quitAll: true }));
    exParseTest(':qa!', new QuitCommand({ bang: true, quitAll: true }));
  });

  suite(':r[ead]', () => {
    exParseTest(':r', new ReadCommand({ opt: [] }));
    exParseTest(':r abc.txt', new ReadCommand({ opt: [], file: 'abc.txt' }));
    exParseTest(':r !ls', new ReadCommand({ opt: [], cmd: 'ls' }));
    exParseTest(
      ':r ++enc=foo abc.txt',
      new ReadCommand({ opt: [['enc', 'foo']], file: 'abc.txt' })
    );
    exParseTest(':r ++enc=foo !ls', new ReadCommand({ opt: [['enc', 'foo']], cmd: 'ls' }));
  });

  suite(':reg[isters]', () => {
    exParseTest(':reg', new RegisterCommand([]));
    exParseTest(':reg b1"2a', new RegisterCommand(['b', '1', '"', '2', 'a']));
    exParseTest(':reg b 1 " 2 a', new RegisterCommand(['b', '1', '"', '2', 'a']));
  });

  suite(':ri[ght]', () => {
    exParseTest(':right', new RightCommand({ width: 80 })); // Defaults to 'textwidth'
    exParseTest(':right40', new RightCommand({ width: 40 }));
    exParseTest(':right 20', new RightCommand({ width: 20 }));
  });

  suite(':se[t]', () => {
    exParseTest(':set', new SetOptionsCommand({ type: 'show_or_set', option: undefined }));
    exParseTest(':set all', new SetOptionsCommand({ type: 'show_or_set', option: 'all' }));
    exParseTest(':set all&', new SetOptionsCommand({ type: 'default', option: 'all', source: '' }));

    for (const option of ['ws', 'wrapscan']) {
      exParseTest(`:set ${option}`, new SetOptionsCommand({ type: 'show_or_set', option }));
      exParseTest(`:set ${option}?`, new SetOptionsCommand({ type: 'show', option }));
      exParseTest(`:set no${option}`, new SetOptionsCommand({ type: 'unset', option }));
      exParseTest(`:set inv${option}`, new SetOptionsCommand({ type: 'invert', option }));
      exParseTest(`:set ${option}!`, new SetOptionsCommand({ type: 'invert', option }));
      exParseTest(
        `:set ${option}&`,
        new SetOptionsCommand({ type: 'default', option, source: '' })
      );
      exParseTest(
        `:set ${option}&vi`,
        new SetOptionsCommand({ type: 'default', option, source: 'vi' })
      );
      exParseTest(
        `:set ${option}&vim`,
        new SetOptionsCommand({ type: 'default', option, source: 'vim' })
      );
      // TODO: :set {option}<
    }

    for (const option of ['sw', 'shiftwidth']) {
      exParseTest(`:set ${option}=4`, new SetOptionsCommand({ type: 'equal', option, value: '4' }));
      exParseTest(`:set ${option}:4`, new SetOptionsCommand({ type: 'equal', option, value: '4' }));
      exParseTest(`:set ${option}+=4`, new SetOptionsCommand({ type: 'add', option, value: '4' }));
      exParseTest(
        `:set ${option}^=4`,
        new SetOptionsCommand({ type: 'multiply', option, value: '4' })
      );
      exParseTest(
        `:set ${option}-=4`,
        new SetOptionsCommand({ type: 'subtract', option, value: '4' })
      );
    }
  });

  suite(':sor[t]', () => {
    exParseTest(':sort', new SortCommand({ reverse: false, ignoreCase: false, unique: false }));
    exParseTest(':sort i', new SortCommand({ reverse: false, ignoreCase: true, unique: false }));
    exParseTest(':sort u', new SortCommand({ reverse: false, ignoreCase: false, unique: true }));
    exParseTest(':sort iu', new SortCommand({ reverse: false, ignoreCase: true, unique: true }));
    exParseTest(':sort ui', new SortCommand({ reverse: false, ignoreCase: true, unique: true }));

    exParseTest(':sort!', new SortCommand({ reverse: true, ignoreCase: false, unique: false }));
    exParseTest(':sort! i', new SortCommand({ reverse: true, ignoreCase: true, unique: false }));
    exParseTest(':sort! u', new SortCommand({ reverse: true, ignoreCase: false, unique: true }));
    exParseTest(':sort! iu', new SortCommand({ reverse: true, ignoreCase: true, unique: true }));
    exParseTest(':sort! ui', new SortCommand({ reverse: true, ignoreCase: true, unique: true }));

    // TODO
  });

  suite(':s[ubstitute]', () => {
    const pattern = Pattern.parser({ direction: SearchDirection.Forward });

    exParseTest(
      ':s/a/b/g',
      new SubstituteCommand({
        pattern: pattern.tryParse('a'),
        replace: 'b',
        flags: { replaceAll: true },
        count: undefined,
      })
    );
    exParseTest(
      ':s/a/b/g 3',
      new SubstituteCommand({
        pattern: pattern.tryParse('a'),
        replace: 'b',
        flags: { replaceAll: true },
        count: 3,
      })
    );
    // Can use weird delimiter
    exParseTest(
      ':s#a#b#g',
      new SubstituteCommand({
        pattern: pattern.tryParse('a'),
        replace: 'b',
        flags: { replaceAll: true },
        count: undefined,
      })
    );
    // Can escape delimiter
    exParseTest(
      ':s/\\/\\/a/b',
      new SubstituteCommand({
        pattern: pattern.tryParse('\\/\\/a'),
        replace: 'b',
        flags: {},
        count: undefined,
      })
    );
    // Can use pattern escapes
    exParseTest(
      ':s/\\ba/b',
      new SubstituteCommand({
        pattern: pattern.tryParse('\\ba'),
        replace: 'b',
        flags: {},
        count: undefined,
      })
    );
    // Can escape replacement
    exParseTest(
      ':s/a/\\b',
      new SubstituteCommand({
        pattern: pattern.tryParse('a'),
        replace: '\b',
        flags: {},
        count: undefined,
      })
    );

    // TODO
  });

  suite(':tabm[ove]', () => {
    exParseTest(
      ':tabm',
      new TabCommand({ type: TabCommandType.Move, count: undefined, direction: undefined })
    );
    exParseTest(
      ':tabm 0',
      new TabCommand({ type: TabCommandType.Move, count: 0, direction: undefined })
    );
    exParseTest(
      ':tabm 10',
      new TabCommand({ type: TabCommandType.Move, count: 10, direction: undefined })
    );
    exParseTest(
      ':tabm +',
      new TabCommand({ type: TabCommandType.Move, count: undefined, direction: 'right' })
    );
    exParseTest(
      ':tabm +10',
      new TabCommand({ type: TabCommandType.Move, count: 10, direction: 'right' })
    );
    exParseTest(
      ':tabm -',
      new TabCommand({ type: TabCommandType.Move, count: undefined, direction: 'left' })
    );
    exParseTest(
      ':tabm -10',
      new TabCommand({ type: TabCommandType.Move, count: 10, direction: 'left' })
    );

    // TODO: these should throw E474; not clear that's the parser's job though
    // exParseFails(':tabm +0');
    // exParseFails(':tabm -0');
    exParseFails(':tabm ++');
    exParseFails(':tabm --');
    exParseFails(':tabm 1+');
    exParseFails(':tabm 1-');
    exParseFails(':tabm x');
    exParseFails(':tabm 1x');
    exParseFails(':tabm x1');
  });

  suite(':y[ank]', () => {
    exParseTest(':y', new YankCommand({ register: undefined, count: undefined }));
    exParseTest(':y a', new YankCommand({ register: 'a', count: undefined }));
    exParseTest(':y 5', new YankCommand({ register: undefined, count: 5 }));
    exParseTest(':y a 5', new YankCommand({ register: 'a', count: 5 }));
  });

  suite(':w[rite]', () => {
    exParseTest(':w', new WriteCommand({ bang: false, opt: [], bgWrite: true }));
    exParseTest(':w!', new WriteCommand({ bang: true, opt: [], bgWrite: true }));

    exParseTest(
      ':w ++bin',
      new WriteCommand({ bang: false, opt: [['bin', undefined]], bgWrite: true })
    );
    exParseTest(
      ':w ++enc=foo',
      new WriteCommand({ bang: false, opt: [['enc', 'foo']], bgWrite: true })
    );
    exParseTest(
      ':w ++bin ++enc=foo',
      new WriteCommand({
        bang: false,
        opt: [
          ['bin', undefined],
          ['enc', 'foo'],
        ],
        bgWrite: true,
      })
    );

    exParseTest(
      ':w ++enc=foo blah.txt',
      new WriteCommand({ bang: false, opt: [['enc', 'foo']], file: 'blah.txt', bgWrite: true })
    );

    exParseTest(':w !foo', new WriteCommand({ bang: false, opt: [], cmd: 'foo', bgWrite: true }));
    exParseTest(':w !', new WriteCommand({ bang: false, opt: [], cmd: '', bgWrite: true }));

    // TODO
  });
});