import json
import re

# 从数据库导出的数据
questions = [
{"id":51,"category":"不进位笔算乘法","content":"用竖式计算：44 × 41 = ","answer":"1804","answer_remainder":None},
{"id":52,"category":"不进位笔算乘法","content":"用竖式计算：22 × 33 = ","answer":"726","answer_remainder":None},
{"id":53,"category":"不进位笔算乘法","content":"用竖式计算：33 × 11 = ","answer":"363","answer_remainder":None},
{"id":54,"category":"不进位笔算乘法","content":"用竖式计算：31 × 11 = ","answer":"341","answer_remainder":None},
{"id":55,"category":"不进位笔算乘法","content":"用竖式计算：41 × 42 = ","answer":"1722","answer_remainder":None},
{"id":56,"category":"不进位笔算乘法","content":"用竖式计算：13 × 33 = ","answer":"429","answer_remainder":None},
{"id":57,"category":"不进位笔算乘法","content":"用竖式计算：31 × 13 = ","answer":"403","answer_remainder":None},
{"id":58,"category":"不进位笔算乘法","content":"用竖式计算：41 × 44 = ","answer":"1804","answer_remainder":None},
{"id":59,"category":"不进位笔算乘法","content":"用竖式计算：21 × 44 = ","answer":"924","answer_remainder":None},
{"id":60,"category":"不进位笔算乘法","content":"用竖式计算：22 × 32 = ","answer":"704","answer_remainder":None},
{"id":61,"category":"不进位笔算乘法","content":"用竖式计算：21 × 44 = ","answer":"924","answer_remainder":None},
{"id":62,"category":"不进位笔算乘法","content":"用竖式计算：32 × 21 = ","answer":"672","answer_remainder":None},
{"id":63,"category":"不进位笔算乘法","content":"用竖式计算：22 × 11 = ","answer":"242","answer_remainder":None},
{"id":64,"category":"不进位笔算乘法","content":"用竖式计算：41 × 14 = ","answer":"574","answer_remainder":None},
{"id":65,"category":"不进位笔算乘法","content":"用竖式计算：22 × 24 = ","answer":"528","answer_remainder":None},
{"id":66,"category":"不进位笔算乘法","content":"用竖式计算：13 × 31 = ","answer":"403","answer_remainder":None},
{"id":67,"category":"不进位笔算乘法","content":"用竖式计算：13 × 33 = ","answer":"429","answer_remainder":None},
{"id":68,"category":"不进位笔算乘法","content":"用竖式计算：42 × 22 = ","answer":"924","answer_remainder":None},
{"id":69,"category":"不进位笔算乘法","content":"用竖式计算：21 × 33 = ","answer":"693","answer_remainder":None},
{"id":70,"category":"不进位笔算乘法","content":"用竖式计算：41 × 11 = ","answer":"451","answer_remainder":None},
{"id":71,"category":"不进位笔算乘法","content":"用竖式计算：11 × 11 = ","answer":"121","answer_remainder":None},
{"id":72,"category":"不进位笔算乘法","content":"用竖式计算：22 × 33 = ","answer":"726","answer_remainder":None},
{"id":73,"category":"不进位笔算乘法","content":"用竖式计算：41 × 44 = ","answer":"1804","answer_remainder":None},
{"id":74,"category":"不进位笔算乘法","content":"用竖式计算：31 × 33 = ","answer":"1023","answer_remainder":None},
{"id":75,"category":"不进位笔算乘法","content":"用竖式计算：11 × 42 = ","answer":"462","answer_remainder":None},
{"id":76,"category":"不进位笔算乘法","content":"用竖式计算：33 × 32 = ","answer":"1056","answer_remainder":None},
{"id":77,"category":"不进位笔算乘法","content":"用竖式计算：11 × 44 = ","answer":"484","answer_remainder":None},
{"id":78,"category":"不进位笔算乘法","content":"用竖式计算：11 × 13 = ","answer":"143","answer_remainder":None},
{"id":79,"category":"不进位笔算乘法","content":"用竖式计算：24 × 24 = ","answer":"576","answer_remainder":None},
{"id":80,"category":"不进位笔算乘法","content":"用竖式计算：22 × 42 = ","answer":"924","answer_remainder":None},
{"id":81,"category":"不进位笔算乘法","content":"用竖式计算：33 × 11 = ","answer":"363","answer_remainder":None},
{"id":82,"category":"不进位笔算乘法","content":"用竖式计算：12 × 22 = ","answer":"264","answer_remainder":None},
{"id":83,"category":"不进位笔算乘法","content":"用竖式计算：21 × 12 = ","answer":"252","answer_remainder":None},
{"id":84,"category":"不进位笔算乘法","content":"用竖式计算：22 × 22 = ","answer":"484","answer_remainder":None},
{"id":85,"category":"不进位笔算乘法","content":"用竖式计算：42 × 24 = ","answer":"1008","answer_remainder":None},
{"id":86,"category":"不进位笔算乘法","content":"用竖式计算：14 × 44 = ","answer":"616","answer_remainder":None},
{"id":87,"category":"不进位笔算乘法","content":"用竖式计算：32 × 11 = ","answer":"352","answer_remainder":None},
{"id":88,"category":"不进位笔算乘法","content":"用竖式计算：31 × 11 = ","answer":"341","answer_remainder":None},
{"id":89,"category":"不进位笔算乘法","content":"用竖式计算：14 × 14 = ","answer":"196","answer_remainder":None},
{"id":90,"category":"不进位笔算乘法","content":"用竖式计算：21 × 41 = ","answer":"861","answer_remainder":None},
{"id":91,"category":"不进位笔算乘法","content":"用竖式计算：11 × 33 = ","answer":"363","answer_remainder":None},
{"id":92,"category":"不进位笔算乘法","content":"用竖式计算：23 × 23 = ","answer":"529","answer_remainder":None},
{"id":93,"category":"不进位笔算乘法","content":"用竖式计算：24 × 44 = ","answer":"1056","answer_remainder":None},
{"id":94,"category":"不进位笔算乘法","content":"用竖式计算：12 × 33 = ","answer":"396","answer_remainder":None},
{"id":95,"category":"不进位笔算乘法","content":"用竖式计算：13 × 13 = ","answer":"169","answer_remainder":None},
{"id":96,"category":"不进位笔算乘法","content":"用竖式计算：23 × 22 = ","answer":"506","answer_remainder":None},
{"id":97,"category":"不进位笔算乘法","content":"用竖式计算：32 × 33 = ","answer":"1056","answer_remainder":None},
{"id":98,"category":"不进位笔算乘法","content":"用竖式计算：13 × 11 = ","answer":"143","answer_remainder":None},
{"id":99,"category":"不进位笔算乘法","content":"用竖式计算：22 × 23 = ","answer":"506","answer_remainder":None},
{"id":100,"category":"不进位笔算乘法","content":"用竖式计算：23 × 23 = ","answer":"529","answer_remainder":None},
]

for q in questions:
    content = q["content"]
    # 提取数字
    nums = re.findall(r'\d+', content)
    if len(nums) >= 2:
        a, b = int(nums[0]), int(nums[1])
        result = int(q["answer"])
        
        # 计算中间乘积
        digits_b = [int(d) for d in str(b)[::-1]]  # 从个位开始
        partials = []
        for i, d in enumerate(digits_b):
            p = a * d
            partials.append((p, i))
        
        # 计算总宽度
        max_len = max(len(str(a)), len(str(b)), len(str(result)))
        width = max_len + 2
        
        lines = []
        # 被乘数行
        lines.append(f"{' ' * (width - len(str(a)))}{a}")
        # 乘数行
        lines.append(f"×{' ' * (width - 1 - len(str(b)))}{b}")
        # 分隔线
        lines.append("-" * (width + 1))
        # 中间乘积
        for p, shift in partials:
            pad = width - len(str(p)) - shift
            lines.append(f"{' ' * pad}{p}")
        # 分隔线
        lines.append("-" * (width + 1))
        # 结果
        lines.append(f"{' ' * (width + 1 - len(str(result)))}{result}")
        
        print(f"ID {q['id']}: {a} × {b} = {result}")
        for line in lines:
            print(f"  |{line}|")
        print()
