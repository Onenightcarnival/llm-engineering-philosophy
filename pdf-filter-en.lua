-- pdf-filter-en.lua: PDF build filter for English edition
-- 1. Remove web navigation paragraphs ("Articles", "Reading Order")
-- 2. Establish three-level heading hierarchy: chapter(h1) -> article(h2) -> section(h3)
-- 3. Strip VitePress warning containers (translation-in-progress notices)

local skip_headings = {
  ["Articles"] = true,
  ["Reading Order"] = true,
  ["Article Index"] = true,
}

local function heading_text(el)
  return pandoc.utils.stringify(el)
end

-- Chapter headings: "Chapter N ..." or "Preface: ..." or "Epilogue: ..."
local function is_chapter_heading(text)
  return text:match("^Chapter %d") ~= nil
    or text:match("^Preface:") ~= nil
    or text:match("^Epilogue:") ~= nil
end

function Blocks(blocks)
  local result = {}
  local skipping = false
  local skip_level = 0
  local in_warning_container = false

  for _, el in ipairs(blocks) do
    -- Skip VitePress ::: warning containers (translation notices)
    if el.t == "Div" and el.classes and el.classes:includes("warning") then
      goto continue
    end

    if el.t == "Header" then
      if skipping and el.level <= skip_level then
        skipping = false
      end

      local text = heading_text(el)

      if skip_headings[text] then
        skipping = true
        skip_level = el.level
      elseif not skipping then
        if el.level == 1 and not is_chapter_heading(text) then
          el.level = 2
        elseif el.level >= 2 and not skip_headings[text] then
          el.level = el.level + 1
        end
      end
    end

    if not skipping then
      result[#result + 1] = el
    end

    ::continue::
  end

  return result
end
