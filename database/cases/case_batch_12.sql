UPDATE calc_question SET raw_content = CASE id
  WHEN 396 THEN '{"type": "division", "lines": [[{"text": "       □", "type": "text"}], [{"text": "    67)247", "type": "text"}], [{"text": "       ---", "type": "text"}]]}'::jsonb
  WHEN 397 THEN '{"type": "division", "lines": [[{"text": "       □", "type": "text"}], [{"text": "    27)117", "type": "text"}], [{"text": "       ---", "type": "text"}]]}'::jsonb
  WHEN 398 THEN '{"type": "division", "lines": [[{"text": "      □□", "type": "text"}], [{"text": "    52)791", "type": "text"}], [{"text": "      ----", "type": "text"}]]}'::jsonb
  WHEN 399 THEN '{"type": "division", "lines": [[{"text": "       □", "type": "text"}], [{"text": "    36)250", "type": "text"}], [{"text": "       ---", "type": "text"}]]}'::jsonb
  WHEN 400 THEN '{"type": "division", "lines": [[{"text": "      □□", "type": "text"}], [{"text": "   57)1058", "type": "text"}], [{"text": "      ----", "type": "text"}]]}'::jsonb
  WHEN 401 THEN '{"type": "division", "lines": [[{"text": "       □", "type": "text"}], [{"text": "    45)331", "type": "text"}], [{"text": "       ---", "type": "text"}]]}'::jsonb
  WHEN 402 THEN '{"type": "division", "lines": [[{"text": "      □□", "type": "text"}], [{"text": "    72)835", "type": "text"}], [{"text": "      ----", "type": "text"}]]}'::jsonb
  WHEN 403 THEN '{"type": "division", "lines": [[{"text": "      □□", "type": "text"}], [{"text": "    25)402", "type": "text"}], [{"text": "      ----", "type": "text"}]]}'::jsonb
  WHEN 404 THEN '{"type": "division", "lines": [[{"text": "       □", "type": "text"}], [{"text": "    29)288", "type": "text"}], [{"text": "       ---", "type": "text"}]]}'::jsonb
  WHEN 405 THEN '{"type": "division", "lines": [[{"text": "      □□", "type": "text"}], [{"text": "   97)1429", "type": "text"}], [{"text": "      ----", "type": "text"}]]}'::jsonb
  WHEN 406 THEN '{"type": "division", "lines": [[{"text": "       □", "type": "text"}], [{"text": "    57)278", "type": "text"}], [{"text": "       ---", "type": "text"}]]}'::jsonb
  WHEN 407 THEN '{"type": "division", "lines": [[{"text": "       □", "type": "text"}], [{"text": "    61)138", "type": "text"}], [{"text": "       ---", "type": "text"}]]}'::jsonb
  WHEN 408 THEN '{"type": "division", "lines": [[{"text": "       □", "type": "text"}], [{"text": "    79)453", "type": "text"}], [{"text": "       ---", "type": "text"}]]}'::jsonb
  WHEN 409 THEN '{"type": "division", "lines": [[{"text": "      □□", "type": "text"}], [{"text": "    58)617", "type": "text"}], [{"text": "      ----", "type": "text"}]]}'::jsonb
  WHEN 410 THEN '{"type": "division", "lines": [[{"text": "      □□", "type": "text"}], [{"text": "    59)773", "type": "text"}], [{"text": "      ----", "type": "text"}]]}'::jsonb
  WHEN 411 THEN '{"type": "division", "lines": [[{"text": "       □", "type": "text"}], [{"text": "    97)933", "type": "text"}], [{"text": "       ---", "type": "text"}]]}'::jsonb
  WHEN 412 THEN '{"type": "division", "lines": [[{"text": "      □□", "type": "text"}], [{"text": "    14)271", "type": "text"}], [{"text": "      ----", "type": "text"}]]}'::jsonb
  WHEN 413 THEN '{"type": "division", "lines": [[{"text": "       □", "type": "text"}], [{"text": "    89)883", "type": "text"}], [{"text": "       ---", "type": "text"}]]}'::jsonb
  WHEN 414 THEN '{"type": "division", "lines": [[{"text": "      □□", "type": "text"}], [{"text": "    19)313", "type": "text"}], [{"text": "      ----", "type": "text"}]]}'::jsonb
  WHEN 415 THEN '{"type": "division", "lines": [[{"text": "      □□", "type": "text"}], [{"text": "   94)1424", "type": "text"}], [{"text": "      ----", "type": "text"}]]}'::jsonb
END WHERE id IN (396, 397, 398, 399, 400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415);