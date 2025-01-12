
export const handler = async (event: { arguments: { taskId: any; status: any; failed: any; failedReason: any; finished: any; finishedAt: any; }; data: { ComputeTasks: { update: (arg0: any) => any; }; }; }) => {
  const { taskId, status, failed, failedReason, finished, finishedAt } = event.arguments;

  try {
    const updateData = {
      taskId,
      ...(status !== undefined && { status }),
      ...(failed !== undefined && { failed }),
      ...(failedReason !== undefined && { failedReason }),
      ...(finished !== undefined && { finished }),
      ...(finished && finishedAt && { finishedAt })
    };

    const response = await event.data.ComputeTasks.update(updateData);
    return response;
  } catch (err) {
    console.error('Error updating compute task:', err);
    throw new Error('Failed to update compute task');
  }
};