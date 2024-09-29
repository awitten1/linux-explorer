
#include <sched.h>
#include <unistd.h>
#include <sys/wait.h>
#include <stdio.h>
#include <sys/mount.h>

int main() {
    if (unshare(CLONE_NEWPID) == -1) {
        perror("unshare failed");
        return 1;
    }
    pid_t pid = fork();
    if (pid) {
        wait(NULL);
    } else {
        pid_t my_pid = getpid();
        pid_t parent_pid = getppid();
        if (unshare(CLONE_NEWNS) == -1) {
            perror("unshare failed");
            return 1;
        }
        // Remount /proc in the new mount namespace
        if (mount("proc", "/proc", "proc", MS_PRIVATE, NULL) == -1) {
            perror("mount failed");
            return 1;
        }
        printf("child pid %d, parent pid %d\n", my_pid, parent_pid);
        pause();
    }
    return 0;
}
