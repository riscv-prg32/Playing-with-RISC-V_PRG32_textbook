git switch -c experiment-embed-game   # create and switch to a branch
# ... make changes, commit them ...
git switch main                        # return to the safe main line
git merge experiment-embed-game        # keep the experiment, OR
git branch -D experiment-embed-game    # discard it entirely
