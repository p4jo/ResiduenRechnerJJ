
<?php


class A {
    const a = 4;
    const b = self::a + 1;
}

class B extends A
{
    public const a = -10;
}

var_dump(A::a);
var_dump(A::b);
var_dump(B::a);
var_dump(B::b);