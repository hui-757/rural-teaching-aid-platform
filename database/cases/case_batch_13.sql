UPDATE calc_question SET raw_content = CASE id
  WHEN 416 THEN '{"type": "division", "lines": [[{"text": "       □", "type": "text"}], [{"text": "     28)85", "type": "text"}], [{"text": "       ---", "type": "text"}]]}'::jsonb
  WHEN 417 THEN '{"type": "division", "lines": [[{"text": "      □□", "type": "text"}], [{"text": "    49)840", "type": "text"}], [{"text": "      ----", "type": "text"}]]}'::jsonb
  WHEN 418 THEN '{"type": "division", "lines": [[{"text": "       □", "type": "text"}], [{"text": "    23)224", "type": "text"}], [{"text": "       ---", "type": "text"}]]}'::jsonb
  WHEN 419 THEN '{"type": "division", "lines": [[{"text": "      □□", "type": "text"}], [{"text": "    28)406", "type": "text"}], [{"text": "      ----", "type": "text"}]]}'::jsonb
  WHEN 420 THEN '{"type": "division", "lines": [[{"text": "      □□", "type": "text"}], [{"text": "   58)1128", "type": "text"}], [{"text": "      ----", "type": "text"}]]}'::jsonb
  WHEN 421 THEN '{"type": "division", "lines": [[{"text": "       □", "type": "text"}], [{"text": "    86)569", "type": "text"}], [{"text": "       ---", "type": "text"}]]}'::jsonb
  WHEN 422 THEN '{"type": "division", "lines": [[{"text": "       □", "type": "text"}], [{"text": "    94)532", "type": "text"}], [{"text": "       ---", "type": "text"}]]}'::jsonb
  WHEN 423 THEN '{"type": "division", "lines": [[{"text": "      □□", "type": "text"}], [{"text": "   89)1370", "type": "text"}], [{"text": "      ----", "type": "text"}]]}'::jsonb
  WHEN 424 THEN '{"type": "division", "lines": [[{"text": "      □□", "type": "text"}], [{"text": "    15)198", "type": "text"}], [{"text": "      ----", "type": "text"}]]}'::jsonb
  WHEN 425 THEN '{"type": "division", "lines": [[{"text": "      □□", "type": "text"}], [{"text": "   67)1102", "type": "text"}], [{"text": "      ----", "type": "text"}]]}'::jsonb
END WHERE id IN (416, 417, 418, 419, 420, 421, 422, 423, 424, 425);