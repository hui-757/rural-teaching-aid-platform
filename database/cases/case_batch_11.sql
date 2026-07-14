UPDATE calc_question SET raw_content = CASE id
  WHEN 376 THEN '{"type": "division", "lines": [[{"text": "      □□", "type": "text"}], [{"text": "    21)313", "type": "text"}], [{"text": "      ----", "type": "text"}]]}'::jsonb
  WHEN 377 THEN '{"type": "division", "lines": [[{"text": "       □", "type": "text"}], [{"text": "    98)945", "type": "text"}], [{"text": "       ---", "type": "text"}]]}'::jsonb
  WHEN 378 THEN '{"type": "division", "lines": [[{"text": "       □", "type": "text"}], [{"text": "    85)539", "type": "text"}], [{"text": "       ---", "type": "text"}]]}'::jsonb
  WHEN 379 THEN '{"type": "division", "lines": [[{"text": "      □□", "type": "text"}], [{"text": "    70)758", "type": "text"}], [{"text": "      ----", "type": "text"}]]}'::jsonb
  WHEN 380 THEN '{"type": "division", "lines": [[{"text": "       □", "type": "text"}], [{"text": "    43)115", "type": "text"}], [{"text": "       ---", "type": "text"}]]}'::jsonb
  WHEN 381 THEN '{"type": "division", "lines": [[{"text": "      □□", "type": "text"}], [{"text": "    47)903", "type": "text"}], [{"text": "      ----", "type": "text"}]]}'::jsonb
  WHEN 382 THEN '{"type": "division", "lines": [[{"text": "      □□", "type": "text"}], [{"text": "    20)331", "type": "text"}], [{"text": "      ----", "type": "text"}]]}'::jsonb
  WHEN 383 THEN '{"type": "division", "lines": [[{"text": "      □□", "type": "text"}], [{"text": "   86)1027", "type": "text"}], [{"text": "      ----", "type": "text"}]]}'::jsonb
  WHEN 384 THEN '{"type": "division", "lines": [[{"text": "      □□", "type": "text"}], [{"text": "    65)708", "type": "text"}], [{"text": "      ----", "type": "text"}]]}'::jsonb
  WHEN 385 THEN '{"type": "division", "lines": [[{"text": "       □", "type": "text"}], [{"text": "    49)416", "type": "text"}], [{"text": "       ---", "type": "text"}]]}'::jsonb
  WHEN 386 THEN '{"type": "division", "lines": [[{"text": "       □", "type": "text"}], [{"text": "    72)390", "type": "text"}], [{"text": "       ---", "type": "text"}]]}'::jsonb
  WHEN 387 THEN '{"type": "division", "lines": [[{"text": "      □□", "type": "text"}], [{"text": "   59)1202", "type": "text"}], [{"text": "      ----", "type": "text"}]]}'::jsonb
  WHEN 388 THEN '{"type": "division", "lines": [[{"text": "      □□", "type": "text"}], [{"text": "    84)961", "type": "text"}], [{"text": "      ----", "type": "text"}]]}'::jsonb
  WHEN 389 THEN '{"type": "division", "lines": [[{"text": "      □□", "type": "text"}], [{"text": "    13)186", "type": "text"}], [{"text": "      ----", "type": "text"}]]}'::jsonb
  WHEN 390 THEN '{"type": "division", "lines": [[{"text": "      □□", "type": "text"}], [{"text": "    12)250", "type": "text"}], [{"text": "      ----", "type": "text"}]]}'::jsonb
  WHEN 391 THEN '{"type": "division", "lines": [[{"text": "      □□", "type": "text"}], [{"text": "    17)298", "type": "text"}], [{"text": "      ----", "type": "text"}]]}'::jsonb
  WHEN 392 THEN '{"type": "division", "lines": [[{"text": "      □□", "type": "text"}], [{"text": "    40)534", "type": "text"}], [{"text": "      ----", "type": "text"}]]}'::jsonb
  WHEN 393 THEN '{"type": "division", "lines": [[{"text": "       □", "type": "text"}], [{"text": "    92)815", "type": "text"}], [{"text": "       ---", "type": "text"}]]}'::jsonb
  WHEN 394 THEN '{"type": "division", "lines": [[{"text": "       □", "type": "text"}], [{"text": "    43)298", "type": "text"}], [{"text": "       ---", "type": "text"}]]}'::jsonb
  WHEN 395 THEN '{"type": "division", "lines": [[{"text": "       □", "type": "text"}], [{"text": "     23)78", "type": "text"}], [{"text": "       ---", "type": "text"}]]}'::jsonb
END WHERE id IN (376, 377, 378, 379, 380, 381, 382, 383, 384, 385, 386, 387, 388, 389, 390, 391, 392, 393, 394, 395);