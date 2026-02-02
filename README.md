# Code Check插件

这是一个基于 [HydroOJ](https://github.com/hydro-dev/Hydro) 的代码相似度检查插件。

写得有些丑，可能有一些不可名状的Bug，还请谨慎使用，如有发现Bug，给我们发Issues。

## 入口

- `/code-check/pid`：对 pid 的题目检查代码相似度

## 权限配置

### 代码相似度检查
`PERM.PERM_CREATE_PROBLEM`（域中可创建题目）：可以检查代码相似度

同时，对于拥有权限`PERM.PERM_CREATE_PROBLEM`的用户，可以看到每道题目侧边栏上用一个检查代码相似度的按钮

当然你可以修改权限配置，有以下几处可以修改：

- `index.ts`第84行，此处为入口
- `templates/partials/problem_sidebar_normal.html`第108行，此处为显示按钮
