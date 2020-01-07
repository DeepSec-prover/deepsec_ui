# Commands : Get Config

Get the current DeepSec configuration: UI -> DeepSec

```
{
  "command": "get_config"
}
```

Reply to get config: DeepSec -> UI

```
{
  "command": "config",
  "version": <string>, // define as: "X.X.X"
  "results_dir_path": <string>
}
```
> The process should stop after this answer.
