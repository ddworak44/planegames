#!/bin/bash
CONTEXT="context.txt"
FILE1="constellations/index.html"
FILE2="constellations/game.js"
TEMP_FILE="tempfile.txt"

echo "FYI: "$(cat $CONTEXT)"" >> $TEMP_FILE &&
echo "Here is $(basename $FILE1): " >> $TEMP_FILE && 
echo echo "$(cat $FILE1)" >> $TEMP_FILE && 
echo "Here is $(basename $FILE2): " >> $TEMP_FILE &&
echo "$(cat $FILE2)" >> $TEMP_FILE

cat tempfile.txt | pbcopy
rm tempfile.txt