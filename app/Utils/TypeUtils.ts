export type Split<Source extends string, Separator extends string> = Source extends `${infer Before}${Separator}${infer After}`
    ? [Before, ...(Split<After, Separator> extends [] ? [After] : Split<After, Separator>)]
    : [];
