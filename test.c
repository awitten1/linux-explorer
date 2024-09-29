
#include <sched.h>
#include <unistd.h>
#include <sys/wait.h>
#include <stdio.h>

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
        printf("child pid %d, parent pid %d\n", my_pid, parent_pid);
        sleep(60);
    }
    return 0;
}
